# Tranche de tableau

La tranche de tableau est utilisée pour afficher des données structurées sous forme de tableau dans un document PBOML. Elle est idéale pour présenter des informations nécessitant des lignes et des colonnes, et prend en charge des fonctionnalités avancées telles que les en-têtes groupés et les séparateurs de lignes.

|Version ajoutée|1.0.0|
|:-:|:-:|

La tranche de tableau est utilisée pour afficher un tableau de données dans le document `pboml`.

## Liste des champs

Dans un document `pboml`, la tranche de tableau est représentée à l'aide de nombreux champs.
Beaucoup de ces champs sont déjà inclus dans la [Liste des champs communs à tous les types de tranche](./FR:-Slice-Objects#liste-des-champs-communs-à-tous-les-types-de-tranche). Cependant, certains champs sont spécifiques à la tranche de tableau.

### Liste des champs uniques à la tranche de tableau

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`type`|String|Obligatoire|Doit être défini à `table`|
|`variables`|Objets variables|Obligatoire|Définit la structure du tableau et les informations sur chaque variable (colonne)|
|`content`|Tableau YAML|Obligatoire|Contient les objets variables avec leurs valeurs associées (les données du tableau)|
|`entrygroups`|Tableau YAML|Optionnel|Définit les groupes de colonnes pour les en-têtes multi-niveaux (ex. : années couvrant plusieurs colonnes)|

### Exemple – Tableau de données rendu

L'exemple suivant montre un tableau avec des colonnes groupées, une ligne séparatrice et différents types de variables, y compris un séparateur. Cet exemple correspond au YAML et au HTML ci-dessous :

<figure style="margin: 1em 0;">
  <figcaption style="font-weight: 300; text-align: center; font-size: 1.2em; margin-bottom: 0.5em;">
    <span style="font-weight: 400;">Tableau 1 –</span>
    <span>Prix des véhicules et coût de possession dans le scénario de référence, dollars canadiens 2022</span>
  </figcaption>
  <div style="overflow-x: auto;">
    <table style="border-collapse: collapse; min-width: 600px; width: 100%; background: #fff;">
      <caption style="display: none;">Tableau 1, Prix des véhicules et coût de possession dans le scénario de référence, dollars canadiens 2022</caption>
      <colgroup>
        <col>
        <col span="2">
        <col span="2">
        <col span="2">
      </colgroup>
      <thead>
        <tr>
          <th></th>
          <th colspan="2" style="border-bottom: 3px solid #d1d5db; color: #334155;">2022</th>
          <th colspan="2" style="border-bottom: 3px solid #94a3b8; color: #334155;">2026</th>
          <th colspan="2" style="border-bottom: 3px solid #d1d5db; color: #334155;">2030</th>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Voitures</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Batterie</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Combustion interne</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Batterie</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Combustion interne</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Batterie</th>
          <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Combustion interne</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Prix d’achat</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">56 850</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">46 220</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">61 520</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">54 800</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">65 140</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">61 610</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Incitatifs financiers</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">7 425</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">480</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Coûts d’utilisation annuels</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">797</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">3 138</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">878</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">2 577</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">960</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">2 625</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Coût total de possession actualisé sur 8 ans</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>55 700</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>66 080</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>67 830</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>73 580</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>72 140</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>80 140</strong></td>
        </tr>
        <tr>
          <td colspan="7" style="background: #f1f5f9; height: 8px; border: none;"></td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">VUS, minifourgonnettes et camions</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Batterie</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Combustion interne</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Batterie</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Combustion interne</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Batterie</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Combustion interne</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Prix d’achat</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">73 400</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">57 220</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">75 500</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">64 010</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">76 320</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">69 720</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Incitatifs financiers</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">7 425</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">480</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">-</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Coûts d’utilisation annuels</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">1 349</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">4 675</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">1 493</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">3 847</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">1 639</td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">3 914</td>
        </tr>
        <tr>
          <th style="border: 1px solid #d1d5db; padding: 4px; background: #e0e7ef; text-align: center;">Coût total de possession actualisé sur 8 ans</th>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>76 640</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>86 710</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>86 580</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>92 030</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>88 270</strong></td>
          <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;"><strong>97 390</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
  <div style="margin-top: 1em;">
    <div style="font-size: 0.95em; border-left: 3px solid #e5e7eb; padding-left: 0.7em; margin-bottom: 0.5em;">
      <strong>Source :</strong> Bureau du directeur parlementaire du budget.
    </div>
    <div style="font-size: 0.95em; border-left: 3px solid #e5e7eb; padding-left: 0.7em;">
      <strong>Note :</strong> Les prix d’achat sont basés sur les écarts de coûts de fabrication et les équipements de recharge à domicile; ils comprennent également les taxes de vente, mais ils ne tiennent pas compte des différences de marges. Les incitatifs financiers comprennent les subventions fédérales et provinciales pour les VZE pondérées en fonction de leur part nationale des VZE. Les coûts d’utilisation annuels comprennent la consommation d’énergie, l’efficacité énergétique, le prix de l’essence et de l’électricité, les kilomètres parcourus et l’entretien. Ils ne tiennent pas compte des différences d’amortissement. Les coûts d’utilisation futurs sont actualisés à un taux de 3 %. Les coûts des VCI sont basés sur les véhicules à essence.
    </div>
  </div>
</figure>


```yaml
  - type: table
    presentation: figure
    referenced_as:
      en: 'Table 1 '
      fr: Tableau 1
    label:
      en: >-
        Vehicle prices and ownership cost in the baseline scenario, 2022
        Canadian dollars
      fr: >-
        Prix et coûts de possession d’un véhicule selon le scénario de
        référence, en dollars canadiens de 2022
    sources:
      - en: Office of the Parliamentary Budget Officer.
        fr: Bureau du directeur parlementaire du budget.
    notes:
      - en: >-
          Purchase prices are based on manufacturing cost differentials, home
          charging equipment and include sales taxes. They do not include
          differences in margins. Incentives include federal and provincial ZEV
          subsidies weighted by their national ZEV share. Annual operating costs
          include energy use, efficiency, gas and electricity prices, kilometers
          driven and maintenance. They do not include differences in
          depreciation. Future operating costs are discounted at a 3 per cent
          rate. ICE costs are based on gasoline-powered vehicles.
        fr: "Les prix d’achat sont basés sur les écarts de coûts de fabrication et les équipements de recharge à domicile; ils comprennent également les taxes de vente, mais ils ne tiennent pas compte des différences de marges. Les incitatifs financiers comprennent les subventions fédérales et provinciales pour les VZE pondérées en fonction de leur part nationale des VZE. Les coûts d’utilisation annuels comprennent la consommation d’énergie, l’efficacité énergétique, le prix de l’essence et de l’électricité, les kilomètres parcourus et l’entretien. Ils ne tiennent pas compte des différences d’amortissement. Les coûts d’utilisation futurs sont actualisés à un taux de 3 %. Les coûts des VCI sont basés sur les véhicules à essence."
    content:
      - cars:
          en: BEV
          fr: Batterie
        purchaseprice: 56850
        incentives:
          en: 7,425
          fr: "7 425"
        annualoperatingcost: 797
        total8yeardiscountedownershipcost:
          en: '**55,700**'
          fr: "**55 700**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: BEV
          fr: Batterie
        iepurchaseprice: 73400
        nrincentives:
          en: 7,425
          fr: "7 425"
        nssannualoperatingcost: 1349
        npektotal8yeardiscountedownershipcost:
          en: '**76,640**'
          fr: "**76 640**"
      - cars:
          en: ICE
          fr: Combustion interne
        purchaseprice: 46220
        incentives:
          en: null
          fr: "-"
        annualoperatingcost: 3138
        total8yeardiscountedownershipcost:
          en: '**66,080**'
          fr: "**66 080**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: ICE
          fr: Combustion interne
        iepurchaseprice: 57220
        nrincentives:
          en: null
          fr: "-"
        nssannualoperatingcost: 4675
        npektotal8yeardiscountedownershipcost:
          en: '**86,710**'
          fr: "**86 710**"
      - cars:
          en: BEV
          fr: Batterie
        purchaseprice: 61520
        incentives:
          en: 480
          fr: "480"
        annualoperatingcost: 878
        total8yeardiscountedownershipcost:
          en: '**67,830**'
          fr: "**67 830**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: BEV
          fr: Batterie
        iepurchaseprice: 75500
        nrincentives:
          en: 480
          fr: "480"
        nssannualoperatingcost: 1493
        npektotal8yeardiscountedownershipcost:
          en: '**86,580**'
          fr: "**86 580**"
      - cars:
          en: ICE
          fr: Combustion interne
        purchaseprice: 54800
        incentives:
          en: null
          fr: "-"
        annualoperatingcost: 2577
        total8yeardiscountedownershipcost:
          en: '**73,580**'
          fr: "**73 580**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: ICE
          fr: Combustion interne
        iepurchaseprice: 64010
        nrincentives:
          en: null
          fr: "-"
        nssannualoperatingcost: 3847
        npektotal8yeardiscountedownershipcost:
          en: '**92,030**'
          fr: "**92 030**"
      - cars:
          en: BEV
          fr: Batterie
        purchaseprice: 65140
        incentives:
          en: null
          fr: "-"
        annualoperatingcost: 960
        total8yeardiscountedownershipcost:
          en: '**72,140**'
          fr: "**72 140**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: BEV
          fr: Batterie
        iepurchaseprice: 76320
        nrincentives:
          en: null
          fr: "-"
        nssannualoperatingcost: 1639
        npektotal8yeardiscountedownershipcost:
          en: '**88,270**'
          fr: "**88 270**"
      - cars:
          en: BEV
          fr: Batterie
        purchaseprice: 61610
        incentives:
          en: null
          fr: "-"
        annualoperatingcost: 2625
        total8yeardiscountedownershipcost:
          en: '**80,140**'
          fr: "**80 140**"
        rszy:
          en: ''
          fr: ''
        suvsminivansandtrucks:
          en: BEV
          fr: Batterie
        iepurchaseprice: 69720
        nrincentives:
          en: null
          fr: "-"
        nssannualoperatingcost: 3914
        npektotal8yeardiscountedownershipcost:
          en: '**97,390**'
          fr: "**97 390**"
    variables:
      cars:
        label:
          en: Cars
          fr: Voitures
        is_descriptive: true
      purchaseprice:
        label:
          en: Purchase price
          fr: Prix d’achat
        type: number
      incentives:
        label:
          en: Incentives
          fr: Incitatifs financiers
      annualoperatingcost:
        label:
          en: Annual operating cost
          fr: Coûts d’utilisation annuels
        type: number
      total8yeardiscountedownershipcost:
        label:
          en: Total 8-year discounted ownership cost
          fr: "Coût total de possession actualisé sur 8 ans"
      rszy:
        type: separator
      suvsminivansandtrucks:
        label:
          en: SUVs, minivans and trucks
          fr: VUS, minifourgonnettes et camions
      iepurchaseprice:
        label:
          en: Purchase price
          fr: Prix d’achat
        type: number
      nrincentives:
        label:
          en: Incentives
          fr: Incitatifs financiers
      nssannualoperatingcost:
        label:
          en: Annual operating cost
          fr: Coûts d’utilisation annuels
        type: number
      npektotal8yeardiscountedownershipcost:
        label:
          en: Total 8-year discounted ownership cost
          fr: "Coût total de possession actualisé sur 8 ans"
    entrygroups:
      - label:
          en: '2022'
          fr: '2022'
        span: 2
      - label:
          en: '2026'
          fr: '2026'
        span: 2
      - label:
          en: '2030'
          fr: '2030'
        span: 2
```

## Description détaillée des champs

### `variables`

L'objet `variables` définit la structure du tableau. Chaque variable est identifiée par une clé unique, référencée dans les objets du champ `content`. Les variables peuvent représenter des colonnes de données, des colonnes descriptives ou des types spéciaux comme les séparateurs.

#### Liste des champs valides pour un objet variable

|nom du champ|type|optionnalité|Description|
|:-:|:-:|:-:|:-:|
|`label`|Objet chaîne localisée|Obligatoire pour les variables de données|Décrit la variable à l'utilisateur|
|`group`|Objet chaîne localisée|Optionnel|Groupe les variables pour les en-têtes multi-niveaux|
|`units`|Objet chaîne localisée|Optionnel|Unité personnalisée des valeurs représentées par la variable|
|`type`|String|Optionnel|Type de valeur (`number`, `markdown` ou `separator`)|
|`emphasize`|Booléen|Optionnel|Met en valeur les valeurs de la variable|
|`is_descriptive`|Booléen|Optionnel|Indique que la variable est descriptive (rendu comme une cellule `<th>`)|

Un objet variable est structuré ainsi :

```yaml
      {cle_variable}:
        label:
          en: {label_en}
          fr: {label_fr}
        group:
          en: {nom_groupe}
          fr: {nom_groupe}
        unit:
          en: {unite}
          fr: {unite}
        type: {number | markdown | separator}
        emphasize: {true | false}
        is_descriptive: {true | false}
```

#### Type de variable `separator`

Une variable avec `type: separator` est utilisée pour insérer une ligne de séparation visuelle dans le tableau. La valeur de cette variable dans le tableau `content` doit être une chaîne vide ou omise. Lors du rendu, cela crée une ligne avec un fond ou un espacement, couvrant toutes les colonnes, pour séparer visuellement les sections du tableau.

#### `label`

Le champ `label` est obligatoire pour les variables de données et est un [Objet chaîne localisée](./FR:-Anatomie-d'un-document-PBOML#note-sur-les-objets-de-texte-localisé).

#### `group`

Le champ `group` est optionnel et permet de regrouper des variables pour les en-têtes multi-niveaux. Les variables ayant la même valeur de `group` seront regroupées dans l'en-tête du tableau.

#### `unit`

Le champ `unit` est optionnel et décrit l'unité des valeurs de la variable. Les unités sont affichées soit au-dessus du tableau, soit sous chaque libellé de variable, selon le cas.

#### `type`

Le champ `type` décrit le type de valeur pour la variable. Types supportés :
- `number` : valeurs numériques
- `markdown` : texte formaté en markdown
- `separator` : utilisé pour la séparation visuelle des lignes (voir ci-dessus)

#### `emphasize`

Si défini à `true`, le rendu mettra en valeur la variable et ses valeurs (ex. : gras ou surlignage).

#### `is_descriptive`

Si défini à `true`, le rendu affichera le contenu de cette variable comme une cellule `<th />` (généralement la première colonne).

### `content`

Le tableau `content` contient les données du tableau. Chaque objet du tableau représente une ligne, avec des clés correspondant aux variables définies dans `variables`. Les lignes séparatrices sont créées en incluant une variable de type `separator` avec une valeur vide.

Exemple :

```yaml
    content:
      - cars:
          en: BEV
          fr: Batterie
        purchaseprice: 56850
        incentives:
          en: 7,425
          fr: "7 425"
        annualoperatingcost: 797
        total8yeardiscountedownershipcost:
          en: '**55,700**'
          fr: "**55 700**"
        rszy: ''  # Ligne séparatrice
        suvsminivansandtrucks:
          en: BEV
          fr: Batterie
        iepurchaseprice: 73400
        nrincentives:
          en: 7,425
          fr: "7 425"
        nssannualoperatingcost: 1349
        npektotal8yeardiscountedownershipcost:
          en: '**76,640**'
          fr: "**76 640**"
      # ...autres lignes...
```

### `entrygroups`

Le tableau `entrygroups` définit les groupes de colonnes pour les en-têtes multi-niveaux. Chaque groupe spécifie un libellé et un span (nombre de colonnes couvertes). Cela permet de créer des en-têtes comme des années couvrant plusieurs colonnes.

Exemple :

```yaml
    entrygroups:
      - label:
          en: '2022'
          fr: '2022'
        span: 2
      - label:
          en: '2026'
          fr: '2026'
        span: 2
      - label:
          en: '2030'
          fr: '2030'
        span: 2
```
