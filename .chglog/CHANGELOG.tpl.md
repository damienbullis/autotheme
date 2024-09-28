{{ if .Versions -}}
<a name="unreleased"></a>
## [Unreleased]

{{ if .Unreleased.CommitGroups -}}
{{ range .Unreleased.CommitGroups -}}
### {{ .Title }}
{{ range .Commits -}}
- [[{{ .Hash.Short }}]({{ $.Info.RepositoryURL }}/commit/{{ .Hash.Short }})] {{ .Subject }}
{{ end }}
{{ end -}}
{{ end -}}
{{ end -}}

{{ range .Versions }}
<a name="{{ .Tag.Name }}"></a>
## {{ if .Tag.Previous }}[{{ .Tag.Name }}]{{ else }}{{ .Tag.Name }}{{ end }} - {{ datetime "2006-01-02" .Tag.Date }}

### ✨ Features
{{ range .CommitGroups -}}
  {{ if eq .Title "feat" }}
    {{ range .Commits -}}
    - {{ .Subject }} ([{{ .Hash.Short }}]({{ $.Info.RepositoryURL }}/commit/{{ .Hash.Short }}))
    {{ end }}
  {{ end }}
{{ end }}

### 🛠  Improvements
{{ range .CommitGroups -}}
  {{ if eq .Title "chore" }}
    {{ range .Commits -}}
    - {{ .Subject }} ([{{ .Hash.Short }}]({{ $.Info.RepositoryURL }}/commit/{{ .Hash }}))
    {{ end }}
  {{ end }}
{{ end }}

### 🐛  Bug Fixes
{{ range .CommitGroups -}}
  {{ if eq .Title "bug" }}
    {{ range .Commits -}}
    - {{ .Subject }} ([{{ .Hash.Short }}]({{ $.Info.RepositoryURL }}/commit/{{ .Hash }}))
    {{ end }}
  {{ end }}
{{ end }}

{{ range .CommitGroups -}}
  {{ if or (not (eq .Title "feat")) (not (eq .Title "chore")) (not (eq .Title "bug")) }}

### 🚧 Other Changes

    {{ range .Commits -}}
    - {{ .Subject }} ([{{ .Hash.Short }}]({{ $.Info.RepositoryURL }}/commit/{{ .Hash }}))
    {{ end }}
  {{ end }}
{{ end }}

{{- if .RevertCommits -}}
### Reverts
{{ range .RevertCommits -}}
- {{ .Revert.Header }}
{{ end }}
{{ end -}}

{{- if .NoteGroups -}}
{{ range .NoteGroups -}}
### {{ .Title }}
{{ range .Notes }}
{{ .Body }}
{{ end }}
{{ end -}}
{{ end -}}
{{ end -}}

{{- if .Versions }}
[Unreleased]: {{ .Info.RepositoryURL }}/compare/{{ $latest := index .Versions 0 }}{{ $latest.Tag.Name }}...HEAD
{{ range .Versions -}}
{{ if .Tag.Previous -}}
[{{ .Tag.Name }}]: {{ $.Info.RepositoryURL }}/compare/{{ .Tag.Previous.Name }}...{{ .Tag.Name }}
{{ end -}}
{{ end -}}
{{ end -}}