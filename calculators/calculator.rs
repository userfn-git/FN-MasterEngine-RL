use std::io::{self, Write};

fn main() {
    let mut input = String::new();
    print!("First number: "); io::stdout().flush().unwrap(); io::stdin().read_line(&mut input).unwrap();
    let left: f64 = match input.trim().parse() { Ok(value) => value, Err(_) => { eprintln!("Invalid number"); return; } };
    input.clear();
    print!("Operator (+, -, *, /): "); io::stdout().flush().unwrap(); io::stdin().read_line(&mut input).unwrap();
    let operator = input.trim().chars().next().unwrap_or('\0');
    input.clear();
    print!("Second number: "); io::stdout().flush().unwrap(); io::stdin().read_line(&mut input).unwrap();
    let right: f64 = match input.trim().parse() { Ok(value) => value, Err(_) => { eprintln!("Invalid number"); return; } };
    let result = match operator { '+' => Some(left + right), '-' => Some(left - right), '*' => Some(left * right), '/' if right != 0.0 => Some(left / right), '/' => { eprintln!("Cannot divide by zero"); None }, _ => { eprintln!("Unknown operator"); None } };
    if let Some(value) = result { println!("Result: {value}"); }
}
