output "instance_id" {
  value = aws_instance.web.id
}

output "instance_public_ip" {
  value = aws_instance.web.public_ip
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.users.name
}
