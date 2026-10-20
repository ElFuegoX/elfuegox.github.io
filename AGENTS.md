# Directives de Securite pour Agents IA

## 1. Garde-fous obligatoires
- Ce projet utilise pre-commit pour auditer les commits et push.
- INTERDICTION FORMELLE d'utiliser --no-verify ou -n sur git commit / git push.
- En cas d'erreur de hook, corriger la cause reelle et retenter le commit standard.

## 2. Secrets & Cles d'API
- Aucun secret, token ou mot de passe en dur dans le code source.
- Utiliser exclusivement des variables d'environnement (.env non versionne).

## 3. Dependances & CI
- Ne jamais ajouter de dependances vulnerables.
- Figer les GitHub Actions avec leur SHA complet.
