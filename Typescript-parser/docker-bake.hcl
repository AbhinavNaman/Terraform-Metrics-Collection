group "default" {
  targets = ["log-parser"]
}

target "log-parser" {
  context = "."
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = ["abhinavnaman/terraform-log-parser:log-parser3"]
  push = true
}
