workflow "Build Docs" {
  on = "push"
  resolves = "Build Docs on Push"
}

action "Build Docs on Push" {
  uses = "./actions/build-docs"
  secrets = [
    "GITHUB_TOKEN"
  ]
}