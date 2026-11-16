Le langage PBOML est utilisé pour publier certains types de rapports et analyses produites par le Bureau du directeur parlementaire du budget. Malgré que sa conception ai été fortement orientée par cet usage plutôt spécifique, l'impératif de conserver le langage et les outils connexes agnostiques face au contenu publié est une valeur guidant leur développement.

Le langage PBOML a été conçu pour répondre à des critères simples mais cruciaux dans le contexte d'une organisation produisant une grande quantité de publications spécialisées sous haute contrainte de temps et de personnel.

## Utilisateurs cibles

Son usage, dans le cadre des opérations de publication, doit pouvoir être possible par un continuum de trois niveaux d'utilisateurs

- _Personnel administratif_ : avec une formation d'une heure, sans expérience préalable en programmation, en vue d'effectuer des changements mineurs (par exemple, la correction d'une erreur typographique) via une interface graphique ou, très occasionnellement, directement dans le code source du fichier.
- _Analystes économiques/financiers_ : formation d'une heure et expérience préalable avec des outils d'analyse statistiques en ligne de commande et/ou programmation de scripts (Stata, MATLAB, R, etc.). Ces utilisateurs doivent pouvoir assister le développeur dans la publication (en modifiant manuellement les chiffres ou le texte contenu dans une structure pré-existante).
- _Développeur web junior_ : formation poussée, capable de manipuler l'entièreté d'un document en se fiant sur la documentation et impliquer les analystes dans le processus de révision/publication.

Le PBOML se démarque d'autres formats alternatifs plus difficiles à opérer sans formation poussées, comme le LaTeX.

## Lisible par l'homme et par la machine

Dans de nombreuses situations, il est important que le bureau ait la possibilité d'apporter des modifications en masse aux documents à publier, au moment même de leur publication. Par exemple, il est crucial de pouvoir modifier la date de publication d'une série de documents ou d'insérer des données manquantes provenant d'une base de données externe. Ces manipulations de contenu doivent pouvoir être scriptés pour être exécutés de manière fiable, sans intervention humaine.

À l'inverse, il est aussi utile de pouvoir utiliser un script pour extraire des données depuis un document. Par exemple, dans le cadre des publications liées au BDPB, il pourrait être utile d'extraire d'une série de notes d'évaluation d'une même mesure législative l'ensemble de coûts lui étant attribués de façon à construire un seul tableau et le garder automatiquement à jour au fil des publications.

Notre expérience avec un langage de balisage permissif, comme le HTML, nous montre que ces manipulations sont très difficiles à reproduire à grande échelle et sujettes au bris. Quand aux langages plus stricts - comme le XML ou le JSON - leur capacité à demeure lisible et éditable par un être humain s'amenuise rapidement.

## Aucun logiciel spécifique

Pour des raisons opérationnelles, la production du contenu doit être entièrement réalisée sans recours à des logiciels spécialisés. Un navigateur et, potentiellement, un éditeur de texte brut sont tout l'arsenal nécessaire aux utilisateurs.

Cette contrainte exclue d'emblée les logiciels d'édition professionnels.

## Imprimé et web

Les produits d'analyse du BDPB sont destinés à différents médias: le Web et l'imprimé. En effet, alors que la majorité de la clientèle accède à ces documents via un support numérique, une version prête à imprimer (un PDF) doit être impérativement produite en vue de son dépôt officiel au Parlement.

En plus de devoir répondre aux minimales prévues par le cadre législatif en matière d'accessibilité et de bilinguisme, nous nous efforçons d'aller au delà de ces normes lorsque possible. Par exemple, les versions Web des documents doivent être entièrement adapté à une consultation via un téléphone intelligent, tant en matière de responsivité (taille d'écran réduite) que de taille des fichiers en cas de connexion cellulaire limitée. Nous nous assurons également d'adopter les meilleures pratiques en matière de Web accessible et méta-données, et ce de façon systématique.

Contrairement à une solution qui allierait un CMS doté d'un éditeur HTML WYSIWIG à un logiciel de traitement de texte, le langage PBOML et les outils lui étant associés ont été conçus de manière à produire des documents de la plus haute qualité en ne priorisant pas l'un de ces moyen de communication plutôt qu'un autre.

## Contenu varié

La nature du travail du BDPB impose une grande variété de contenus dans les documents publiés : texte riche, graphiques et tableaux sont légions.

Quoi que le langage PBOML l'utilise abondamment dans ses tranches de texte, le recours à un langage de balisage simple (le Markdown, par exemple) comme seul support s'avère trop limitatif. Le recours à une structure prédéfinie s'avère également nécessaire par la contrainte énumérée plus tôt d'insertion et de lecture machine des données et méta-données dans les documents.

## Côté client

En raison de contraintes liées à l'absence d'une équipe dédiée à l'infrastructure Web, l'essentiel des opérations liées du processus de production doit s'effectuer côté client, sans recourir à un serveur. 

Ainsi, les outils liés au PBOML (le parseur, le moteur de rendu et l'éditeur de contenu) sont conçus pour être exclusivement exécutés dans un navigateur Web. La génération de PDF, elle, est possible manuellement ou grâce au recours à un script s'exécutant à l'aide d'une solution infonuagique à la demande (en l'occurence, AWS Lambda).

Finalement, parce que les fichiers contenant du PBOML sont essentiellement des fichiers de texte brut, ils peuvent être stockés et traités sans modifications par les progiciels de gestion de l'information utilisés dans les institutions fédérales (GCdocs, par exemple).