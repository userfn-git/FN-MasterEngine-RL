#include <iostream>
#include <stdexcept>

int main() {
    double left, right; char op;
    std::cout << "First number: "; if (!(std::cin >> left)) return 1;
    std::cout << "Operator (+, -, *, /): "; std::cin >> op;
    std::cout << "Second number: "; if (!(std::cin >> right)) return 1;
    try {
        double result;
        switch (op) {
            case '+': result = left + right; break;
            case '-': result = left - right; break;
            case '*': result = left * right; break;
            case '/': if (right == 0) throw std::runtime_error("cannot divide by zero"); result = left / right; break;
            default: throw std::runtime_error("unknown operator");
        }
        std::cout << "Result: " << result << '\n';
    } catch (const std::exception& error) { std::cerr << "Error: " << error.what() << '\n'; return 1; }
}
