# Graph Slices

## Sample line chart

```yaml
pboml:
  version: 1.0.0
slices:
  - type: graph
    readonly: false
    display_label: true
    chart_type: bar
    axes:
      x:
        label: __Person__
      y:
        label: __Salary__
        style: currency
    arraytable: [["Employee","_Salary_22_","_Salary_23_"],["Mike",35000,35000],["Bob",35000,37000],["Alice",44000,47000],["Frank",27000,30000],["Floyd",92000,97000],["Fritz",18500,25000]] 
    strings:
      en:
        __Person__: Employee's name
        __Salary__: Salary
        _Salary_22_: 2022 Salary
        _Salary_23_: 2023 Salary
      fr:
        __Person__: Nom de l'employé
        __Salary__: Salaire
        _Salary_22_: Salaire en 2022
        _Salary_23_: Salaire en 2023
    label:
      en: ACME Employee Salaries
      fr: Salaire des employés de ACME
```

