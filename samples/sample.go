package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type Result[T any] struct {
	Value T
	Err   error
}

type Cache[K comparable, V any] struct {
	mu    sync.RWMutex
	items map[K]V
}

func NewCache[K comparable, V any]() *Cache[K, V] {
	return &Cache[K, V]{items: make(map[K]V)}
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
	c.mu.RLock()
	defer c.mu.RUnlock()
	v, ok := c.items[key]
	return v, ok
}

func (c *Cache[K, V]) Set(key K, value V) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items[key] = value
}

type Server struct {
	addr    string
	cache   *Cache[string, []byte]
	timeout time.Duration
}

func NewServer(addr string) *Server {
	return &Server{
		addr:    addr,
		cache:   NewCache[string, []byte](),
		timeout: 30 * time.Second,
	}
}

func (s *Server) Handle(ctx context.Context, path string) Result[[]byte] {
	if data, ok := s.cache.Get(path); ok {
		return Result[[]byte]{Value: data}
	}

	ctx, cancel := context.WithTimeout(ctx, s.timeout)
	defer cancel()

	select {
	case <-ctx.Done():
		return Result[[]byte]{Err: ctx.Err()}
	case <-time.After(100 * time.Millisecond):
		data := []byte(fmt.Sprintf("response for %s", path))
		s.cache.Set(path, data)
		return Result[[]byte]{Value: data}
	}
}

func main() {
	srv := NewServer(":8080")
	paths := []string{"/api/users", "/api/posts", "/health"}

	var wg sync.WaitGroup
	for _, p := range paths {
		wg.Add(1)
		go func(path string) {
			defer wg.Done()
			r := srv.Handle(context.Background(), path)
			if r.Err != nil {
				fmt.Printf("error: %v\n", r.Err)
				return
			}
			fmt.Printf("%s => %s\n", path, r.Value)
		}(p)
	}
	wg.Wait()
}
