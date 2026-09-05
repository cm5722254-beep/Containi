# ស្ថាបត្យកម្មប្រព័ន្ធ និងដ្យាក្រាម (System Architecture & Diagrams)

ឯកសារនេះបង្ហាញពីស្ថាបត្យកម្មរួមនៃប្រព័ន្ធ ដ្យាក្រាម Use Case និងទម្រង់ទិន្នន័យ Database ERD។

---

## ១. ដ្យាក្រាមស្ថាបត្យកម្មប្រព័ន្ធ (System Architecture Diagram)

ប្រព័ន្ធនេះត្រូវបានរៀបចំឡើងតាមបែប **Microservice & Multi-Container Tiered Architecture**៖

```mermaid
graph TB
    Client["🌐 Client Browser / User\n(Port 80)"]
    
    subgraph Host_Machine ["Host Machine (Physical Server / VM)"]
        subgraph Docker_Engine ["Docker Engine Engine & Container Runtime"]
            subgraph Custom_Network ["Docker Custom Network: app-network (Bridge)"]
                
                Nginx["🔀 Nginx Reverse Proxy Container\n(Service: nginx | Port 80)"]
                Frontend["💻 Frontend Container\nNext.js 14 (Service: frontend:3000)"]
                Backend["⚙️ Backend Container\nExpress.js + TS (Service: backend:5000)"]
                Postgres[("🐘 Database Container\nPostgreSQL 16 (Service: postgres:5432)")]
                Redis[("⚡ Cache Container\nRedis 7 In-Memory (Service: redis:6379)")]
                
            end
            
            subgraph Docker_Volumes ["Docker Named Volumes (Persistent Storage)"]
                VolPG[("postgres_data\n(/var/lib/postgresql/data)")]
                VolRD[("redis_data\n(/data)")]
            end
        end
    end

    Client -->|HTTP Port 80| Nginx
    Nginx -->|Proxy: /| Frontend
    Nginx -->|Proxy: /api/| Backend
    Backend -->|SQL Query| Postgres
    Backend -->|Cache GET/SET| Redis
    Postgres -.->|Persist Data| VolPG
    Redis -.->|Persist Data| VolRD
```

---

## ២. ដ្យាក្រាម Use Case (Use Case Diagram)

```mermaid
graph LR
    Customer((👤 Customer))
    Admin((👑 Admin))

    subgraph E_Commerce_System ["ប្រព័ន្ធ Containerized E-Commerce"]
        UC1([ចុះឈ្មោះ / ចូលគណនី - Auth])
        UC2([មើល និងស្វែងរកផលិតផល - Browse/Search])
        UC3([គ្រប់គ្រងកន្ត្រកទំនិញ - Cart])
        UC4([បញ្ជាទិញទំនិញ - Checkout])
        UC5([មើលប្រវត្តិកុម្ម៉ង់ - Orders])
        
        UC6([មើលផ្ទាំងស្ថិតិ - Dashboard Stats])
        UC7([គ្រប់គ្រងទំនិញ - Product CRUD])
        UC8([គ្រប់គ្រងប្រភេទ - Categories])
        UC9([កែប្រែស្ថានភាពកុម្ម៉ង់ - Manage Orders])
        UC10([ពិនិត្យ Docker Health - Container Topology])
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5

    Admin --> UC1
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
```

---

## ៣. ដ្យាក្រាមទិន្នន័យ Database ERD (Entity Relationship Diagram)

តារាងទាំងអស់ត្រូវបានរៀបចំក្នុង PostgreSQL Container ដែលមាន Foreign Keys និង Constraints ច្បាស់លាស់៖

```mermaid
erDiagram
    users ||--o{ orders : places
    users ||--o| cart : owns
    categories ||--o{ products : categorizes
    products ||--o{ cart_items : contains
    cart ||--o{ cart_items : holds
    orders ||--o{ order_items : includes
    products ||--o{ order_items : references

    users {
        int id PK
        string name
        string email UK
        string password
        string role
        timestamp created_at
    }

    categories {
        int id PK
        string name
        string slug UK
        string description
    }

    products {
        int id PK
        int category_id FK
        string name
        string description
        numeric price
        int stock
        string image_url
    }

    cart {
        int id PK
        int user_id FK,UK
        timestamp updated_at
    }

    cart_items {
        int id PK
        int cart_id FK
        int product_id FK
        int quantity
    }

    orders {
        int id PK
        int user_id FK
        numeric total_amount
        string status
        string shipping_address
        timestamp created_at
    }

    order_items {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        numeric unit_price
    }
```
