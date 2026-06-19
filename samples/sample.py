"""Sample Python file for theme preview."""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Generic, TypeVar

T = TypeVar("T")

TIMEOUT = 30
_registry: dict[str, type] = {}


@dataclass
class Config:
    host: str = "localhost"
    port: int = 8080
    debug: bool = False
    tags: list[str] = field(default_factory=list)


class Result(Generic[T]):
    def __init__(self, value: T | None = None, error: str | None = None):
        self.value = value
        self.error = error

    @property
    def ok(self) -> bool:
        return self.error is None

    def unwrap(self) -> T:
        if self.error is not None:
            raise ValueError(self.error)
        assert self.value is not None
        return self.value


def register(name: str):
    def decorator(cls: type) -> type:
        _registry[name] = cls
        return cls
    return decorator


@register("worker")
class Worker:
    def __init__(self, config: Config):
        self.config = config
        self._running = False

    async def run(self) -> None:
        self._running = True
        try:
            while self._running:
                await asyncio.sleep(1)
                print(f"Working on {self.config.host}:{self.config.port}")
        except asyncio.CancelledError:
            pass
        finally:
            self._running = False


async def main() -> None:
    cfg = Config(host="0.0.0.0", port=3000, debug=True)
    worker = Worker(cfg)

    numbers = [x**2 for x in range(10) if x % 2 == 0]
    mapping = {k: v for k, v in enumerate(numbers)}

    task = asyncio.create_task(worker.run())
    await asyncio.sleep(5)
    task.cancel()
    await task


if __name__ == "__main__":
    asyncio.run(main())
