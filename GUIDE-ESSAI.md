# Faire un essai réel

Comment tester ez-proto sur une vraie tâche, de bout en bout, dans Cursor comme le feront les devs. Le but est double: obtenir une maquette utile, et noter ce que l'agent rate pour corriger les règles, le catalogue ou les patrons.

Pour un essai fixe, à refaire après chaque ajustement et à comparer d'une fois à l'autre: [`SCENARIO-TEST.md`](SCENARIO-TEST.md).

## 1. Avant de commencer (5 min)

- **Partir d'un état propre dans git** (`git status` vide). C'est ce qui permet de voir exactement ce que l'agent a créé ou touché (`git status`, `git diff`), et de revenir en arrière au besoin.
- **Choisir une vraie tâche GoodDay**, ni triviale ni énorme: un écran ou une interaction, idéalement une tâche où la maquette aurait vraiment servi. Noter son numéro (`#49198`) et son lien court (`https://www.goodday.work/t/…`).
- **Ouvrir `ez-proto` comme dossier racine dans Cursor**, et pas le mono, pour que `AGENTS.md` soit chargé.
- **Lancer le shell dans un terminal de Cursor**, et le laisser tourner:
  ```bash
  pnpm dev
  ```
- **Ouvrir le navigateur de Cursor** sur `http://localhost:5180`, à côté de l'agent.

## 2. Demander le prototype, comme un dev le ferait

Dans l'agent de Cursor, avec la commande `/new-proto` ou en texte libre:

> Nouveau prototype pour la tâche #49198 (https://www.goodday.work/t/M2nSjU): « titre de la tâche ». [Coller la description de la tâche GoodDay, ou résumer le besoin en 3-4 lignes: qui, quoi, contraintes.]

Ne pas en dire plus que ce qu'un dev aurait sous la main: le but est de voir si les règles suffisent.

**Ce qui devrait se passer**, et donc ce qu'il faut vérifier:

1. Il lance `pnpm proto new 49198 <lien> "Titre" --from <patron>`.
2. Il remplit le brief dans `README.md`, puis construit `v001` avec au moins deux scénarios.
3. Il lance `pnpm proto check` et corrige les ✗.
4. Il ouvre le prototype dans son navigateur et vérifie chaque scénario, le mode sombre et la largeur mobile.
5. Il répond avec la tâche, la version, un résumé et ses questions ouvertes.

## 3. Itérer comme en vrai

Donner 2 ou 3 retours, comme dans une vraie revue:

- **« Déplace X, ajoute Y »**: il doit créer une `v002` avec `proto iterate`, sans toucher à `v001`.
- **« Montre une autre approche »**: il doit créer une variante, `v002b`.
- **Un besoin qu'aucun composant actuel ne couvre**: c'est le test du parcours des propositions. Il doit créer `components/EzQuelqueChose.vue` avec l'en-tête `<!-- @proposal … -->`, pas du HTML brut dans `index.vue`.

Dans le shell, comparer `v001` et `v002` côte à côte, changer de scénario et passer en sombre. Ensuite:

```bash
pnpm proto diff 49198
```

```bash
pnpm proto proposals
```

## 4. Juger le résultat

À noter pendant l'essai:

| Question | Où regarder |
|---|---|
| Est-ce que ça ressemble à eZsign? | Le prototype à côté de la vraie app |
| A-t-il respecté les versions immuables? | `git diff` sur les versions précédentes |
| A-t-il inventé du visuel ou contourné une règle? | `git diff`, et les ⚠ de `pnpm proto check` |
| Ses propositions sont-elles au bon niveau, avec un bon nom? | `pnpm proto proposals` |
| Combien de retours avant un résultat utilisable? | Le ressenti, et le nombre de versions |
| Où a-t-il hésité ou posé des questions? | La conversation |

Chaque erreur de l'agent se corrige à un endroit précis:

| L'agent… | On corrige… |
|---|---|
| ne suit pas une consigne | `AGENTS.md` |
| utilise mal un composant | sa fiche « quand l'utiliser » dans `blueprint/ez/CATALOG.md` |
| assemble mal une page | un patron dans `blueprint/patterns/` (ou un nouveau) |
| contourne une règle sans que rien ne le signale | `pnpm proto check` (`tool/cli/commands/check.mjs`) |

## 5. Finir comme en vrai

- Marquer la version retenue:
  ```bash
  pnpm proto status 49198 chosen v002
  ```
- Exporter la version pour la partager. Le fichier HTML est autonome: on l'ouvre sans serveur, avec ses scénarios et le bouton clair / sombre.
  ```bash
  pnpm proto export 49198
  ```
- Si une proposition vaut la peine (décision humaine):
  ```bash
  pnpm proto promote 49198 v002 EzQuelqueChose
  ```
- Commiter le prototype et ses notes.

## À savoir avant l'essai

- **Les couleurs partent de la marque, mais ne sont pas encore validées contre la prod.** Les teintes d'ancrage sont les bonnes; le fond de l'app, la police et le thème sombre restent à comparer à de vraies captures.
- **Il n'y a que trois patrons** (liste, fiche, formulaire), et ils sont inventés. Si la tâche ressemble à un écran sans patron, l'agent aura moins de repères: c'est une bonne information pour la suite.
