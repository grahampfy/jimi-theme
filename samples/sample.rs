use std::collections::HashMap;
use std::fmt;

#[derive(Debug, Clone)]
pub enum Value {
    Null,
    Bool(bool),
    Int(i64),
    Float(f64),
    Text(String),
    List(Vec<Value>),
}

impl fmt::Display for Value {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Value::Null => write!(f, "null"),
            Value::Bool(b) => write!(f, "{b}"),
            Value::Int(n) => write!(f, "{n}"),
            Value::Float(n) => write!(f, "{n:.2}"),
            Value::Text(s) => write!(f, "\"{s}\""),
            Value::List(items) => {
                let inner: Vec<String> = items.iter().map(|v| v.to_string()).collect();
                write!(f, "[{}]", inner.join(", "))
            }
        }
    }
}

pub struct Store {
    data: HashMap<String, Value>,
}

impl Store {
    pub fn new() -> Self {
        Self {
            data: HashMap::new(),
        }
    }

    pub fn set(&mut self, key: impl Into<String>, value: Value) {
        self.data.insert(key.into(), value);
    }

    pub fn get(&self, key: &str) -> Option<&Value> {
        self.data.get(key)
    }

    pub fn keys(&self) -> Vec<&str> {
        self.data.keys().map(|k| k.as_str()).collect()
    }
}

trait Validate {
    fn is_valid(&self) -> bool;
}

impl Validate for Value {
    fn is_valid(&self) -> bool {
        match self {
            Value::Text(s) => !s.is_empty(),
            Value::List(v) => !v.is_empty(),
            _ => true,
        }
    }
}

fn main() {
    let mut store = Store::new();
    store.set("name", Value::Text("jimi".to_string()));
    store.set("version", Value::Int(1));
    store.set("rate", Value::Float(0.95));
    store.set("active", Value::Bool(true));
    store.set(
        "tags",
        Value::List(vec![
            Value::Text("theme".into()),
            Value::Text("vscode".into()),
        ]),
    );

    for key in store.keys() {
        if let Some(val) = store.get(key) {
            println!("{key}: {val} (valid: {})", val.is_valid());
        }
    }
}
