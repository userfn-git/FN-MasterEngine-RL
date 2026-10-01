using System;

Console.Write("First number: ");
if (!double.TryParse(Console.ReadLine(), out double left)) { Console.WriteLine("Error: invalid number"); return; }
Console.Write("Operator (+, -, *, /): ");
string op = Console.ReadLine()?.Trim() ?? "";
Console.Write("Second number: ");
if (!double.TryParse(Console.ReadLine(), out double right)) { Console.WriteLine("Error: invalid number"); return; }
try {
    double result = op switch {
        "+" => left + right,
        "-" => left - right,
        "*" => left * right,
        "/" when right != 0 => left / right,
        "/" => throw new DivideByZeroException("cannot divide by zero"),
        _ => throw new ArgumentException("unknown operator")
    };
    Console.WriteLine($"Result: {result}");
} catch (Exception error) { Console.WriteLine($"Error: {error.Message}"); }
