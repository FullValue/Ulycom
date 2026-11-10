# Site ULYCOM

Site statique multi-pages : accueil, réalisations, offre, prise de rendez-vous, une page par projet, mentions légales.
Le design, les styles et les interactions reprennent ceux de pulsor.agency ; le contenu est celui d'ULYCOM.
Le bleu `#0171e3` remplace le noir d'origine, et la section d'appel à l'action avant le pied de page (fond animé « Wave Gradient ») reprend celle de fluxbase.framer.website.

## Lancer le site

```bash
node dev.mjs
```

Puis ouvrir http://localhost:4321. Le site est reconstruit à chaque chargement de page, il suffit de recharger après une modification.

```bash
node build.mjs
```

Génère le site final dans `dist/` (c'est ce dossier qu'on met en ligne). Aucune dépendance à installer, Node suffit.

## Où modifier quoi

| Je veux changer… | Fichier |
| --- | --- |
| Textes, nom, boutons, lien partenaire, WhatsApp, Cal.com, e-mail, mentions légales | `src/data/site.json` |
| Les projets (réalisations) | `src/data/projects.json` |
| Les avis clients | `src/data/reviews.json` |
| Les logos clients | `src/data/clients.json` |
| La colonne de la page Offre | `src/data/offer.json` |
| La structure d'une page | `src/pages/*.hbs`, `src/partials/*.hbs`, `src/layout.hbs` |
| Les styles | `public/assets/css/ulycom.css` (ajustements ULYCOM) ; `base.css` et `custom.css` sont le design d'origine |
| Les interactions | `public/assets/js/main.js` |
| Les couleurs (bleu, dégradés des boutons) | bloc « Bleu ULYCOM » de `public/assets/css/ulycom.css` |
| Le pied de page révélé au scroll | textes : `footer` dans `site.json` ; structure : `src/partials/footer.hbs` ; effet et formes ASCII : `initFooterReveal` dans `main.js` (`FOOTER_REVEAL.parallax` : 1 = immobile, 0.25 = comme good-fella.com) |
| Le header « île » (encoche Mac sur desktop, Dynamic Island sur mobile) | structure : début de `src/partials/shell.hbs` ; styles : bloc « Header île » de `ulycom.css` (`--sp-spring` = courbe du ressort, `--sp-dur` = durée) ; états : `initSpHeader` dans `main.js` (`SP_ISLAND.collapseOnScroll` : `false` pour que l'encoche reste toujours déployée sur desktop) |
| La section d'appel à l'action | textes : `cta` dans `site.json` ; structure : `src/partials/cta.hbs` ; animation : `WAVE_GRADIENT` dans `main.js` |

### Ajouter un vrai projet

Dans `src/data/projects.json`, chaque projet a ces champs :

- `slug` : l'adresse de la page (`/projects/<slug>`), `name`, `description`
- `category` : sert au filtre de la page Réalisations (les boutons sont créés à partir des catégories présentes)
- `format` et `tags` : les pastilles affichées ; `icon` est un fichier de `public/assets/img/icons/` (`onepage`, `multipage`, `globe`, `bag`, `app`, `window`, `tool`, `ai`, `building`)
- `animated` : affiche la pastille « Animé » ; `showcase` : met le projet dans les sliders
- `period` : texte libre affiché après « Projet réalisé » (ex. `en 2024`), ou `date` au format `AAAA-MM` ; `url` : le site en ligne (laisser vide pour masquer les boutons « Voir en ligne »)
- `sections` : les blocs de l'accordéon « Projet » (`title` + `html`) ; `team` : l'équipe (`name`, `role`, `avatar`)

Images, à déposer dans `public/assets/img/projects/` puis à référencer avec un chemin commençant par `/assets/…` :

- `cover` : visuel principal, ratio 60:36 (ex. 1680 × 1008)
- `logo` : pastille carrée
- `coverTall` (optionnel) : visuel de la carte showcase, cadré en haut à gauche
- `gallery` (optionnel) : liste de captures affichées sous le visuel de la page projet
- `media` (optionnel) : `[{ "device": "desktop", "image": "…", "video": "…m3u8 ou mp4" }, { "device": "mobile", … }]`

- `video` (optionnel) : `{ "src": "…mp4", "poster": "…", "label": "…" }`, affichée en tête de galerie

Les projets actuels viennent du portfolio `github.com/YnsELY/portfolio` (images converties en WebP, captures Lead'Em recadrées pour retirer les noms et numéros de prospects).

Tant qu'un champ image est vide, un visuel provisoire est généré automatiquement (`tools/placeholders.mjs`).

### Réglages à renseigner dans `site.json`

- `booking` : le module de réservation de `/rendez-vous` (calendrier, créneaux, formulaire). Réglages : `days` (1 = lundi … 0 = dimanche), `start`, `end`, `step`, `breaks`, `duration` (minutes), `minNoticeHours`, `maxDays`, textes, `projectTypes`, `budgets`.
  Les créneaux sont calculés à partir de ces règles, en heure de Paris : ils ne lisent pas un agenda réel.
  Envoi de la demande, dans cet ordre : `booking.endpoint` (URL qui reçoit un POST JSON, par exemple un formulaire Formspree), sinon `email` (ouvre la messagerie du visiteur avec la demande pré-remplie), sinon `whatsapp`. Sans aucun des trois, le site en ligne affiche « réservation pas encore activée ».
- `calLink` : identifiant Cal.com (`compte/type-de-rendez-vous`). S'il est rempli, l'agenda Cal.com remplace le module de réservation.
- `whatsapp` : numéro au format international. Vide = la bulle renvoie vers `/rendez-vous`.
- `email`, `url` (adresse finale du site, active le sitemap et les balises canoniques), `legal`.

### Police des titres

Les titres du design d'origine utilisent PP Mori (police sous licence commerciale, non incluse ici). Geist la remplace.
Pour l'utiliser, déposer le fichier sous licence dans `public/assets/fonts/PPMori.woff2` : il est pris en compte au build suivant.

## Pourquoi le dossier s'appelle `site.nosync`

Le Bureau de ce Mac est synchronisé avec iCloud Drive et le disque est presque plein : iCloud retire les fichiers du disque
quelques secondes après leur création, et chaque lecture prend ensuite plusieurs dizaines de secondes.
Le suffixe `.nosync` exclut ce dossier de la synchronisation. Il n'est donc **pas sauvegardé dans iCloud**.
Le projet est autonome : il peut être déplacé tel quel hors du Bureau (par exemple dans `~/Developer/ulycom`) et versionné avec Git.
