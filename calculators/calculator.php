<?php
function calculate(float $left, string $operator, float $right): float {
    return match ($operator) {
        '+' => $left + $right,
        '-' => $left - $right,
        '*' => $left * $right,
        '/' => $right == 0.0 ? throw new InvalidArgumentException('cannot divide by zero') : $left / $right,
        default => throw new InvalidArgumentException('unknown operator'),
    };
}

$left = (float) readline('First number: ');
$operator = trim(readline('Operator (+, -, *, /): '));
$right = (float) readline('Second number: ');
try { echo 'Result: ' . calculate($left, $operator, $right) . PHP_EOL; }
catch (InvalidArgumentException $error) { echo 'Error: ' . $error->getMessage() . PHP_EOL; }
