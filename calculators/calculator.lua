io.write("First number: ")
local left = tonumber(io.read())
io.write("Operator (+, -, *, /): ")
local operator = io.read()
io.write("Second number: ")
local right = tonumber(io.read())

if not left or not right then
  print("Error: invalid number")
elseif operator == "+" then print("Result: " .. left + right)
elseif operator == "-" then print("Result: " .. left - right)
elseif operator == "*" then print("Result: " .. left * right)
elseif operator == "/" and right ~= 0 then print("Result: " .. left / right)
elseif operator == "/" then print("Error: cannot divide by zero")
else print("Error: unknown operator") end
