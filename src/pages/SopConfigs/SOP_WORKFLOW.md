# SOP System — Workflow Graphs

Visual reference for the SOP (Standard Operating Procedure) feature.
Frontend: `ERP-Client/src/pages/SopConfigs/` · Backend: `ERP-Server/src/{routes,controllers,services}/sop/`

---

## 1. High-level architecture

```mermaid
graph LR
    subgraph Client["FRONTEND (ERP-Client)"]
        Form["SOPForm.js<br/>(builder UI)"]
        Listener["SOPAlertListener.js<br/>(toast on NEW_SOP_ALERT)"]
    end

    subgraph Server["BACKEND (ERP-Server)"]
        API["/sop/create<br/>/sop/fields/:model<br/>/sop/getroles"]
        Ctrl["createsop.controller<br/>sopMetaController"]
        DB[("MongoDB<br/>SOPRule, SOPAlert")]
        Hooks["Model post('save') hooks<br/>VitalSign, LabReport, ..."]
        Engine["sopEngine.js<br/>(subscriber)"]
        Socket["sopSocketService.js<br/>(Socket.IO emitter)"]
    end

    Redis[("Redis Pub/Sub<br/>sop:evaluate<br/>sop:alerts")]

    Form -- "POST payload" --> API
    API --> Ctrl --> DB
    Hooks -- "publish sop:evaluate" --> Redis
    Redis -- "sop:evaluate" --> Engine
    Engine -- "read rules" --> DB
    Engine -- "write SOPAlert" --> DB
    Engine -- "publish sop:alerts" --> Redis
    Redis -- "sop:alerts" --> Socket
    Socket -- "NEW_SOP_ALERT" --> Listener
```

---

## 2. Rule-creation workflow

```mermaid
sequenceDiagram
    actor User
    participant Form as SOPForm
    participant Config as Configuration.js
    participant Modal as ConfirmModal
    participant API as POST /sop/create
    participant Ctrl as createSop controller
    participant DB as MongoDB

    User->>Form: Fill rule, conditions, routing
    Form->>Form: On model change → GET /sop/fields/:model<br/>(cached in modelFieldsCache)
    User->>Form: Click "Create SOP Rule"
    Form->>Form: validate() + formatCondition()
    Form->>Config: onSubmit(payload)
    Config->>Modal: open confirm
    User->>Modal: Confirm
    Modal->>API: sopConfigure(payload)
    API->>Ctrl: req.body
    Ctrl->>Ctrl: validate fields,<br/>check duplicate ruleName,<br/>resolve author from Employee
    Ctrl->>DB: SOPRule.insertMany([...])
    DB-->>Ctrl: inserted docs
    Ctrl-->>API: 201 { count, data }
    API-->>Config: response → toast.success
```

---

## 3. Runtime evaluation + alert delivery

```mermaid
sequenceDiagram
    actor Clinician
    participant App as Any controller<br/>(e.g. VitalSign create)
    participant Hook as Mongoose post('save')
    participant Pub as Redis publisher
    participant Eng as sopEngine
    participant DB as MongoDB
    participant Sock as sopSocketService
    participant UI as SOPAlertListener

    Clinician->>App: Submit VitalSign / LabReport / etc.
    App->>DB: save doc
    DB-->>Hook: post('save') fires
    Hook->>Pub: publish 'sop:evaluate'<br/>{ targetModel, payload, triggerType }
    Pub-->>Eng: message
    Eng->>DB: SOPRule.find({ active, matches trigger })
    Eng->>DB: Patient.findById(payload.patient)

    loop For each rule
        Eng->>Eng: satisfyingCriteria pass?
        alt fails
            Eng-->>Eng: skip rule
        else passes
            loop For each targetBlock
                Eng->>DB: fetch model data (cached in ctx)
                Eng->>Eng: evaluateLeaf for each condition
                alt all conditions pass
                    Eng->>DB: SOPAlert.create(...)
                    Eng->>Pub: publish 'sop:alerts'
                end
            end
        end
    end

    Pub-->>Sock: alert message
    Sock->>Sock: resolve roles → role_<ROLE><br/>resolve users → user_<id>
    Sock->>UI: io.to(room).emit('NEW_SOP_ALERT')
    UI->>Clinician: toast.error([severity] message)
```

---

## 4. Per-rule evaluation logic (inside the engine)

```mermaid
flowchart TD
    Start([sop:evaluate received]) --> FindRules[Find active rules<br/>matching triggerModel + triggerType]
    FindRules --> AnyRules{rules found?}
    AnyRules -- no --> End([done])
    AnyRules -- yes --> LoadPatient[Patient.findById]
    LoadPatient --> ForEach[For each rule]
    ForEach --> HasSC{satisfyingCriteria?}
    HasSC -- no --> Blocks[Evaluate targetBlocks]
    HasSC -- yes --> EvalSC[Evaluate all SC conditions]
    EvalSC --> SCPass{all pass?}
    SCPass -- no --> NextRule[Skip this rule]
    SCPass -- yes --> Blocks
    Blocks --> ForBlock[For each targetBlock]
    ForBlock --> EvalConds[evaluateBlock<br/>fetch model data via ctx cache<br/>evaluateLeaf each condition]
    EvalConds --> BlockPass{all conditions pass?}
    BlockPass -- no --> NextBlock[no alert for this block]
    BlockPass -- yes --> GenAlert[generateAlert:<br/>render template<br/>SOPAlert.create<br/>publish sop:alerts]
    GenAlert --> NextBlock
    NextBlock --> MoreBlocks{more blocks?}
    MoreBlocks -- yes --> ForBlock
    MoreBlocks -- no --> NextRule
    NextRule --> MoreRules{more rules?}
    MoreRules -- yes --> ForEach
    MoreRules -- no --> End
```

---

## 5. Data model

```mermaid
erDiagram
    SOPRule ||--o{ SOPAlert : "fires"
    Patient ||--o{ SOPAlert : "about"
    User ||--o{ SOPRule : "author"
    SOPRule {
        string ruleName UK
        string severity
        string admissionType
        object satisfyingCriteria
        array targetBlocks
        object routing
        bool isActive
    }
    SOPAlert {
        ObjectId patient FK
        ObjectId rule FK
        string severity
        string message
        object routing
        ObjectId triggeredBy
        date createdAt
    }
    Patient {
        string name
        number age
        string gender
        ObjectId addmission
    }
```

---

## 6. Form structure (frontend component tree)

```mermaid
graph TD
    Config["Configuration.js<br/>(page wrapper + ConfirmModal)"]
    SOPForm["SOPForm.js<br/>(state: form, satisfyingCriteria,<br/>targetBlocks, selectedRoles, selectedUsers)"]
    BasicInfo["Basic Info card<br/>ruleName, protocol, severity, admissionType"]
    Main["MainBlock.js<br/>Satisfying Criteria (global filter)"]
    Targets["Target Blocks loop<br/>each = { conditions, alertTemplate }"]
    Cond["ConditionRow.js<br/>model → field → operator → value"]
    Routing["RoutingCard.js<br/>roles + AsyncSelect employees"]
    Alert["Alert Details<br/>actionGuidance, referenceSection"]

    Config --> SOPForm
    SOPForm --> BasicInfo
    SOPForm --> Main
    Main --> Cond
    SOPForm --> Targets
    Targets --> Cond
    SOPForm --> Routing
    SOPForm --> Alert
```

---

## 7. Socket room membership (who hears an alert)

```mermaid
graph LR
    subgraph OnConnect["On socket connect (sopSocketService)"]
        Handshake["socket.handshake.auth.userId"]
        Handshake --> JoinUser["join user_&lt;userId&gt;"]
        Handshake --> ResolveRole["lookup User.role"]
        ResolveRole --> JoinRole["join role_&lt;ROLENAME&gt;"]
        Handshake --> ResolveEmp["lookup Employee by users"]
        ResolveEmp --> JoinEmp["join emp_&lt;empId&gt;"]
    end

    subgraph OnAlert["On sop:alerts message"]
        Alert["alertPayload.routing"]
        Alert --> Roles["for each notifyRoles[]<br/>emit to role_&lt;R&gt;"]
        Alert --> Users["for each notifySpecificUsers[]<br/>resolve emp → users<br/>emit to user_&lt;u&gt;"]
        Roles --> Emit["NEW_SOP_ALERT"]
        Users --> Emit
    end
```

---

## Quirks worth knowing

- **`admissionType` runtime check is commented out** in `sopEngine.js` (lines ~268–292) — rule's ICD/OPD/BOTH currently has no effect at evaluation time.
- **`DELAYED` trigger type** exists in schema + form but no scheduler publishes `triggerType: 'DELAYED'` events yet. The engine filters them out during IMMEDIATE evaluation.
- Only **`VitalSign`** has the `post('save')` Redis publisher today. Other `TARGET_MODELS` (`LabReport`, `Prescription`, tests, etc.) need similar hooks to trigger rules.
- All conditions inside a block are **AND'd**. To express OR, create multiple target blocks.
- `ruleName` is globally **unique** (Mongo index) — `createSop` returns 409 on duplicates.
