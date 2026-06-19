<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;
use App\Contracts\Repository;
use Psr\Log\LoggerInterface;

const DEFAULT_LIMIT = 50;

interface Cache
{
    public function get(string $key): mixed;
    public function set(string $key, mixed $value): void;
}

class UserService extends BaseService implements Repository
{
    private array $cache = [];

    public function __construct(
        private LoggerInterface $logger,
        protected string $prefix = 'user:'
    ) {
    }

    public function find(int $id): ?User
    {
        $key = $this->prefix . $id;

        if (isset($this->cache[$key])) {
            return $this->cache[$key];
        }

        $user = User::query()
            ->where('id', '=', $id)
            ->first();

        if ($user === null) {
            $this->logger->warning("User {$id} not found");
            return null;
        }

        $this->cache[$key] = $user;
        return $user;
    }

    public static function make(): self
    {
        return new self(logger: app(LoggerInterface::class));
    }
}

$service = UserService::make();
$user = $service->find(1);

echo $user?->name ?? 'anonymous';
