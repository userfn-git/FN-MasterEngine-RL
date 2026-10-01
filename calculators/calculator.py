"""A small command-line calculator."""

def calculate(left: float, operator: str, right: float) -> float:
    if operator == "+": return left + right
    if operator == "-": return left - right
    if operator == "*": return left * right
    if operator == "/":
        if right == 0: raise ValueError("cannot divide by zero")
        return left / right
    raise ValueError("unknown operator")


if __name__ == "__main__":
    try:
        left = float(input("First number: "))
        operator = input("Operator (+, -, *, /): ").strip()
        right = float(input("Second number: "))
        print(f"Result: {calculate(left, operator, right):g}")
    except ValueError as error:
        print(f"Error: {error}")
