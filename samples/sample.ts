import { readFileSync } from "fs";

interface User {
  id: number;
  name: string;
  email?: string;
  roles: readonly string[];
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

enum Status {
  Active = "active",
  Inactive = "inactive",
}

const MAX_RETRIES = 3;

async function fetchUser(id: number): Promise<Result<User>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data: User = await res.json();
    return { ok: true, value: data };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

class UserService {
  private cache = new Map<number, User>();

  async getUser(id: number): Promise<User | null> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    const result = await fetchUser(id);
    if (result.ok) {
      this.cache.set(id, result.value);
      return result.value;
    }
    console.warn(`Failed to fetch user ${id}: ${result.error}`);
    return null;
  }
}

// Template literal types
type EventName = `on${"Click" | "Hover" | "Focus"}`;

// Regex
const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Decorators
function log(_target: unknown, key: string, desc: PropertyDescriptor) {
  const orig = desc.value;
  desc.value = function (...args: unknown[]) {
    console.log(`Calling ${key}`);
    return orig.apply(this, args);
  };
}
