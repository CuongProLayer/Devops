$jenkinsfile = Get-Content -Raw -Path "$PSScriptRoot\..\Jenkinsfile"
$escapedScript = [System.Security.SecurityElement]::Escape($jenkinsfile)
$template = @"
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <actions/>
  <description>SmartStock CI/CD Pipeline - DevOps Demo</description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps">
    <script>__SCRIPT_PLACEHOLDER__</script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"@

$xml = $template.Replace("__SCRIPT_PLACEHOLDER__", $escapedScript)
[System.IO.File]::WriteAllText("$PSScriptRoot\job-config-direct.xml", $xml)
Write-Host "Generated job-config-direct.xml successfully!"
