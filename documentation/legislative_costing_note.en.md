# Legislative Costing Note Sample

Serialization of https://www.pbo-dpb.ca/en/publications/LEG-2223-017-M--canada-dental-benefit--prestation-dentaire-canadienne


```yaml
pboml:
  version: 1.0.0
document:
  form: LEG_2022
  id: LEG-2223-017-M
  release_date: '2022-10-20T13:00:00.000Z'
  title:
    en: Canada Dental Benefit
    fr: Prestation dentaire canadienne
  type:
    en: Cost Estimate of Election Campaign Proposal
    fr: Note sur l'évaluation du coût d'une mesure législative
  copyright:
    en: © Office of the Parliamentary Budget Officer, Ottawa, Canada, 2022
    fr: © Bureau du directeur parlementaire du budget, Ottawa, Canada, 2022
slices:
  - type: markdown
    readonly: false
    display_label: true
    label:
      en: Description
      fr: Description
    content:
      en: "The proposed Canada Dental Benefit (CDB) would provide up-front tax-free payments to cover dental expenses for children under 12-years-old.\_\n\n*   $650 would be provided for each eligible child if the family’s adjusted net income is under $70,000.\_\n*   $390 would be provided for each eligible child if the family’s adjusted net income is between $70,000 and $79,999.\n*   $260 would be provided for each eligible child if the family’s adjusted net income is between $80,000 and $89,999.\n\nThere are two benefit periods of CDB. The first period begins on October 1, 2022 and ends on June 30, 2023 and the second period begins on July 1, 2023 and ends on June 30, 2024.\n\nA family is eligible for the benefit when:\n\n1.  the qualified dependant has received or will receive dental care services in Canada during the first or second period.\n2.  the qualified dependant is under 12 years of age on December 1, 2022 for the first period and on July 1, 2023 for the second period,\n3.  the parent is in receipt of a Canada child benefit on that date.\n4.  the qualified dependant has received or will receive dental care services the costs of which have not been and will not be fully paid or reimbursed under a program or plan established by the government of Canada or of a province.\n5.  the qualified dependant is not insured under a dental services plan and does not have access to a dental care insurance plan obtained provided based on the employment of the applicant, their cohabiting spouse or common law partner or any other person.\n\nAn individual receiving the dental benefit will not be able to claim dental expenses covered by this benefit under the Medical Expense Tax Credit. [\\[1\\]](#_ftn1)\n\nThe PBO estimates the cost of Bill C-31 (Dental Benefit) to be $703 million.\n\n[\\[1\\]](#_ftnref1)\_Only dental expenses in excess of the amount of the benefit may be claimed under the credit."
      fr: "Le projet de prestation dentaire canadienne (PDC) prévoit des paiements initiaux et non imposables pour couvrir les frais dentaires des enfants de moins de 12 ans.\_\n\n*   Une prestation de 650 $ sera versée pour chaque enfant admissible issu d’une famille dont le revenu net ajusté est inférieur à 70 000 $.\_\n*   Une prestation de 390\_$ sera versée pour chaque enfant admissible issu d’une famille dont le revenu net ajusté se situe entre 70\_000\_$ et 79\_999\_$.\n*   Une prestation de 260\_$ sera versée pour chaque enfant admissible issu d’une famille dont le revenu net ajusté se situe entre 80\_000\_$ et 89\_999\_$.\n\nLa PDC comporte deux périodes de prestations. La première période s’étend du 1er octobre 2022 au 30 juin 2023, et la deuxième, du 1er juillet 2023 au 30 juin 2024.\n\nUne famille est admissible à la prestation si\_:\n\n1.  la personne à charge admissible a reçu ou recevra des soins dentaires au Canada au cours de la première ou de la deuxième période;\n2.  la personne à charge admissible est âgée de moins de 12\_ans au 1er décembre 2022 pour la prestation de la première période et au 1er juillet 2023 pour la prestation de la deuxième période;\n3.  le parent est bénéficiaire d’une allocation canadienne pour enfants à pareille date;\n4.  la personne à charge admissible a reçu ou recevra des soins dentaires dont les coûts n’ont pas été et ne seront pas entièrement payés ni remboursés en vertu d’un programme ou d’un régime établi par le gouvernement du Canada ou d’une province;\n5.  la personne à charge admissible n’est pas assurée en vertu d’un régime de soins dentaires et n’a pas accès à un tel régime d’assurance par l’entremise de l’emploi du demandeur, du partenaire cohabitant ou du conjoint de fait du demandeur ou de toute autre personne.\n\nUne personne recevant la prestation dentaire ne pourra pas réclamer les frais dentaires couverts par cette prestation au titre du crédit d’impôt pour frais médicaux [\\[1\\]](#_ftn1).\n\nLe DPB estime que le coût du projet de loi C-31 (prestation dentaire) s’élèvera à 703 millions de dollars.\n\n[\\[1\\]](#_ftnref1)\_Seuls les frais dentaires qui dépassent le montant de la prestation peuvent être réclamés au titre du crédit."
  - type: table
    readonly: false
    display_label: true
    label:
      en: 5-Year Cost
      fr: Coût sur 5 ans
    content:
      - fiscalyear:
          en: 2022-23
          fr: 2022-2023
        totalcost: 247
      - fiscalyear:
          en: 2023-24
          fr: 2023-2024
        totalcost: 372
      - fiscalyear:
          en: 2024-25
          fr: 2024-2025
        totalcost: 83
      - fiscalyear:
          en: 2025-26
          fr: 2025-2026
        totalcost: 0
      - fiscalyear:
          en: 2026-27
          fr: 2026-2027
        totalcost: 0
      - fiscalyear:
          en: Total
          fr: Total
        totalcost: 703
    variables:
      fiscalyear:
        label:
          en: Fiscal Year
          fr: Année fiscale
        type: markdown
        readonly: true
        display_label: false
        is_descriptive: true
      totalcost:
        label:
          en: Total cost
          fr: Coût total
        type: number
        readonly: false
        display_label: true
  - type: markdown
    readonly: false
    display_label: false
    label:
      en: Notes
      fr: Notes
    content:
      en: >
        - Estimates are presented on a cash basis. Estimates would be subject to
        adjustments based on appropriate accrual calculations. 

        - A positive number implies a deterioration in the budgetary balance
        (lower revenues or higher spending). A negative number implies an
        improvement in the budgetary balance (higher revenues or lower
        spending).
      fr: >
        - Les estimations sont présentées selon la méthode de comptabilité de
        caisse. Les estimations seraient sujettes à des ajustements basés sur
        des calculs de comptabilité d’exercice appropriés.

        - Un nombre positif indique une détérioration du solde budgétaire (en
        raison d’une baisse des revenus ou d’une augmentation des charges). Un
        nombre négatif indique une amélioration du solde budgétaire (en raison
        d’une hausse des revenus ou d’une baisse des charges).
  - type: markdown
    readonly: false
    display_label: true
    label:
      en: Estimation and projection method
      fr: Estimation et méthode de projection
    content:
      en: "The total cost of the dental benefit was calculated by summing the total base amount and the behavioral cost.\n\nThe total base amount was calculated by multiplying the number of estimated beneficiaries in each family income group by the CDB.\n\nThe number of beneficiaries was estimated by multiplying the number of eligible children by the participation rate. Eligible children under 12 years old who are uninsured or partially insured by the public sector and who belong to a family with a net income of less than $90,000 were determined using a customized version of Statistics Canada's Social Policy Simulation Database/Health Model (SPSD/Health) and considering the fees/limits of coverage and type of dental services covered by provincial oral health care programs and the utilization rate of each service.[\\[1\\]](#_ftn1)\n\nThe participation rate is approximated by the percent of children under 12 years of age who report having visited a dental professional during the year for any reason. Participation rates of 76% and 90% were used for uninsured and publicly insured children, respectively.[\\[2\\]](#_ftn2) \_\n\nWith the introduction of the CDB, it is assumed access to dental care services will be less constrained by income, and more people will participate in the federal plan. The participation rate for children from higher income families was used to approximate the higher number of beneficiaries (behaviour impact).[\\[3\\]](#_ftn3)\n\nThe dental expenses covered by this benefit will not be eligible for the Medical Expense Tax Credit (METC). The change in the federal income tax payable in response to the reduction in the METC was used to calculate the federal savings.[\\[4\\]](#_ftn4)\n\nThe dental expenses are the sum of routine care costs and special treatment costs. Telus Health Analytics’ Dental Data Metrics was used to compute the average costs of various dental procedures for children, adjusted for inflation.\n\nAdministration costs was calculated as a share of benefits paid. The percentage of 5% was used and is based on Non-Insured Health Benefits (NIHB) program currently offered by the federal government.[\\[5\\]](#_ftn5)\n\n  \n\n[\\[1\\]](#_ftnref1)\_This analysis is based on Statistics Canada’s Social Policy Simulation Database and Model (SPSD/M). The assumptions and calculations underlying the SPSD/M simulation results were prepared by the Office of the Parliamentary Budget Officer (PBO) and the responsibility for the use and interpretation of these data is entirely that of the PBO.\n\n[\\[2\\]](#_ftnref2)\_The participation rates are from Canadian Health Measures Survey (CHMS). Retrieved from\_[https://publications.gc.ca/collections/collection\\_2010/sc-hc/H34-221-2010-eng.pdf](https://publications.gc.ca/collections/collection_2010/sc-hc/H34-221-2010-eng.pdf)\_\n\n[\\[3\\]](#_ftnref3)\_Ibid., note 3.\n\n[\\[4\\]](#_ftnref4)\_The glass box of the Social Policy Simulation Database and Model (SPSD/Health) was used to estimate the impact of the change in the METC on the Federal income tax.\n\n[\\[5\\]](#_ftnref5)\_Government of Canada. (2022). Non-Insured Health Benefits program: First Nations and Inuit Health Branch: Annual report 2020 to 2021. Retrieved from\_[https://www.sac-isc.gc.ca/eng/1645718409378/1645718500555#chp10](https://www.sac-isc.gc.ca/eng/1645718409378/1645718500555#chp10)"
      fr: >-
        Le coût total de la prestation dentaire a été calculé en additionnant le
        montant de base total et le coût comportemental.


        Le montant de base total a été calculé en multipliant le nombre de
        bénéficiaires estimé de chaque groupe de revenu familial par la PDC.


        Le nombre de bénéficiaires a été estimé en multipliant le nombre
        d’enfants admissibles par le taux de participation. Le nombre d’enfants
        admissibles de moins de 12ans qui ne sont pas assurés ou qui sont
        partiellement assurés par le secteur public et qui proviennent d’une
        famille dont le revenu net inférieur à 90000$ a été déterminé à l’aide
        d’une version personnalisée de la Base de données et Modèle de
        simulation de politiques sociales Santé (BD/MSPS Santé) de Statistique
        Canada et en tenant compte des frais et des limites de couverture ainsi
        que du type de soins dentaires couverts par les programmes provinciaux
        de soins buccodentaires et du taux d’utilisation de chaque
        service[\[1\]](#_ftn1).


        Le taux de participation est estimé par le pourcentage d’enfants de
        moins de 12ans qui ont déclaré avoir consulté un professionnel des soins
        dentaires au cours de l’année, quelle qu’en soit la raison. Des taux de
        participation de 76% et de 90% ont été utilisés pour les enfants non
        assurés et les enfants assurés par le secteur public,
        respectivement[\[2\]](#_ftn2). 


        Avec l’introduction de la PDC, on suppose que l’accès aux soins
        dentaires sera moins limité par le revenu et que davantage de personnes
        participeront au régime fédéral. Le taux de participation des enfants
        issus de familles ayant un revenu élevé a été utilisé pour estimer le
        nombre plus élevé de bénéficiaires (incidence sur le
        comportement)[\[3\]](#_ftn3).


        Les frais dentaires couverts par cette prestation ne pourront pas être
        réclamés au titre du crédit d’impôt pour frais médicaux (CIFM). La
        variation de l’impôt fédéral sur le revenu à payer entraînée par la
        réduction du CIFM a été utilisée pour calculer les économies
        fédérales[\[4\]](#_ftn4).


        Les frais dentaires sont la somme des frais de soins courants et des
        frais de traitements spéciaux. Les données mesurables en matière de
        soins dentaires de Telus Health Analytics ont été utilisées pour
        calculer le coût moyen de diverses interventions dentaires pour les
        enfants, rajusté en fonction de l’inflation.


        Les coûts administratifs ont été calculés en proportion des prestations
        versées. Le pourcentage utilisé, soit 5%, s’appuie sur le Programme des
        services de santé non assurés (SSNA) actuellement offert par le
        gouvernement fédéral[\[5\]](#_ftn5).

          

        [\[1\]](#_ftnref1)La présente analyse repose sur la Base de données et
        le Modèle de simulation de politiques sociales (BD/MSPS) de Statistique
        Canada. Les hypothèses et les calculs qui sous-tendent les résultats de
        la simulation de la BD/MSPS ont été préparés par le Bureau du directeur
        parlementaire du budget (DPB), qui se tient entièrement responsable de
        l’utilisation et de l’interprétation de ces données.


        [\[2\]](#_ftnref2)Les taux de participation sont tirés de l’Enquête
        canadienne sur les mesures de la santé (ECMS). Récupéré à l’adresse
        :[https://publications.gc.ca/collections/collection\_2010/sc-hc/H34-221-2010-fra.pdf](https://publications.gc.ca/collections/collection_2010/sc-hc/H34-221-2010-fra.pdf)


        [\[3\]](#_ftnref3)_Ibid_., note3.


        [\[4\]](#_ftnref4)La version « boîte de verre » de la Base de données et
        du Modèle de simulation de politique sociale (BD/MSPS Santé) a été
        utilisée pour estimer l’incidence de la modification du CIFM sur l’impôt
        fédéral sur le revenu.


        [\[5\]](#_ftnref5)Gouvernement du Canada. (2022). Programme des services
        de santé non assurés : Direction générale de la santé des Premières
        Nations et des Inuits : rapport annuel 2020 à 2021. Récupéré à l’adresse
        :[https://www.sac-isc.gc.ca/fra/1645718409378/1645718500555](https://www.sac-isc.gc.ca/fra/1645718409378/1645718500555)
  - type: markdown
    readonly: false
    display_label: false
    label:
      en: Source of Uncertainty
      fr: Sources de l’incertitude
    content:
      en: >-
        The 2007 Canadian Health Measures Survey (CHMS) data do not reflect 2022
        Canadian tax filers or the current income distribution, which may over
        or underestimate the number of recipients.


        The number of beneficiaries partially insured by federal and provincial
        dental plans is sensitive to the limit of each coverage and the nature
        of the dental services covered. The PBO assumption is subject to this
        data limitations. 


        The estimated total base benefit and behavioral costs are sensitive to
        the choice of participation rates.


        Changes in the rate of fee increases, inflation, or the prevalence of
        diseases would also influence costs.
      fr: >-
        Les données de l’Enquête canadienne sur les mesures de la santé (ECMS)
        de 2007 ne sont pas à l’image des contribuables canadiens en 2022 ni de
        la répartition actuelle des revenus, ce qui peut entraîner une
        estimation supérieure ou inférieure du nombre de bénéficiaires.


        Le nombre de bénéficiaires partiellement assurés par les régimes de
        soins dentaires fédéral et provinciaux est sensible à la limite de
        chaque couverture et à la nature des soins dentaires couverts.
        L’hypothèse du DPB est sujette à ces limitations de données. 


        L’estimation de la prestation de base totale et les coûts
        comportementaux sont sensibles au choix des taux de participation.


        Tout changement concernant le taux d’augmentation des honoraires,
        l’inflation ou la prévalence des affections est également susceptible
        d’influer sur les coûts.
  - type: kvlist
    readonly: false
    display_label: true
    label:
      en: Data Sources
      fr: Sources des données
    content:
      - key:
          content:
            fr: Enfants admissibles
            en: Eligible children
        value:
          content:
            fr: 'BD/MSPS 29.0 et BD/MSPS Santé '
            en: SPSD/M 29.0 and SPSD/M Health
      - key:
          content:
            fr: CIFM et impôt fédéral sur le revenu
            en: METC and federal income tax
        value:
          content:
            fr: BD/MSPS Santé (boîte de verre)
            en: SPSD/M Health (Glass box)
      - key:
          content:
            fr: Taux de participation et d’utilisation
            en: Participation and utilization rates
        value:
          content:
            fr: Enquête canadienne sur les mesures de la santé
            en: Canada Health Measures Survey
      - key:
          content:
            fr: Coût des interventions
            en: Procedure costs
        value:
          content:
            fr: >-
              Données mesurables en matière de soins dentaires de Telus Health
              Analytics
            en: Telus Health Analytics Dental Data Metrics
      - key:
          content:
            fr: Taux d’inflation
            en: Inflation rates
        value:
          content:
            fr: Modèle économique du DPB
            en: PBO economic model
      - key:
          content:
            fr: Coûts administratifs
            en: Administrative Costs
        value:
          content:
            fr: Rapport annuel de 2020 à 2021 des SSNA
            en: NIHB annual report 2020 to 2021
      - key:
          content:
            fr: >-
              Programmes provinciaux de soins de santé buccodentaire ciblant les
              enfants
            en: Provincial oral health care programs targeting children
        value:
          content:
            fr: Santé Canada et les gouvernements provinciaux
            en: Health Canada and provincial governments
    prototype:
      key:
        type: markdown
        label:
          en: Variable
          fr: Variable
      value:
        type: markdown
        label:
          en: Source
          fr: Source
  - type: table
    readonly: false
    display_label: true
    label:
      en: 'Supplementary Data: Detailed 5-Year Cost'
      fr: 'Données supplémentaires : Coût détaillé sur 5 ans'
    content:
      - fiscalyear:
          en: 2022-23
          fr: 2022-2023
        staticcost: 202
        behaviorcost: 43
        admincost: 12
        recoverycost: -11
        totalcost: 247
      - fiscalyear:
          en: 2023-24
          fr: 2023-2024
        staticcost: 296
        behaviorcost: 69
        admincost: 18
        recoverycost: -11
        totalcost: 372
      - fiscalyear:
          en: 2024-25
          fr: 2024-2025
        staticcost: 65
        behaviorcost: 16
        admincost: 4
        recoverycost: -2
        totalcost: 83
      - fiscalyear:
          en: 2025-26
          fr: 2025-2026
        staticcost: 0
        behaviorcost: 0
        admincost: 0
        recoverycost: 0
        totalcost: 0
      - fiscalyear:
          en: 2026-27
          fr: 2026-2027
        staticcost: 0
        behaviorcost: 0
        admincost: 0
        recoverycost: 0
        totalcost: 0
      - fiscalyear:
          en: Total
          fr: Total
        staticcost: 564
        behaviorcost: 128
        admincost: 35
        recoverycost: -23
        totalcost: 703
    variables:
      fiscalyear:
        label:
          en: Fiscal Year
          fr: Année fiscale
        type: markdown
        readonly: true
        display_label: false
        is_descriptive: true
      staticcost:
        label:
          en: Static cost
          fr: Coût statique
        type: number
        readonly: false
        display_label: true
      behaviorcost:
        label:
          en: Behavior cost
          fr: Coût comportemental
        type: number
        readonly: false
        display_label: true
      admincost:
        label:
          en: Administration cost
          fr: Coût administratif
        type: number
        readonly: false
        display_label: true
      recoverycost:
        label:
          en: Cost recovery
          fr: Recouvrement des coûts
        type: number
        readonly: false
        display_label: true
      totalcost:
        label:
          en: Total cost
          fr: Coût total
        type: number
        readonly: false
        display_label: true
```