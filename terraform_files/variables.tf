variable "region" {
  default = "us-west-2"
}

variable "instance_type" {
  default = "t2.micro"
}

variable "ami" {
  default = "ami-0c55b159cbfafe1f0" // Example AMI for Ubuntu 18.04
}

variable "key_name" {
  description = "Name of the SSH key pair"
}

variable "allowed_ip" {
  description = "IP address allowed to SSH"
}
