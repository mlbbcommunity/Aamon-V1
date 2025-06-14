modules = ["nodejs-20"]

[nix]
channel = "stable-24_05"

[workflows]
runButton = "Project"

[[workflows.workflow]]
name = "Project"
mode = "parallel"
author = "agent"

[[workflows.workflow.tasks]]
task = "workflow.run"
args = "WhatsApp Bot"

[[workflows.workflow]]
name = "WhatsApp Bot"
author = "agent"

[[workflows.workflow.tasks]]
task = "shell.exec"
args = "npm install @adiwajshing/baileys @hapi/boom pino qrcode-terminal && node index.js"

[deployment]
run = ["sh", "-c", "npm install @adiwajshing/baileys @hapi/boom pino qrcode-terminal && node index.js"]
