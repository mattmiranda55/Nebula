# 🌌 Nebula

<div align="center">

![Nebula Logo](static/favicon.png)

**A Modern Universal Database Management Tool**

Built with Tauri, Svelte, Rust, and Flowbite

[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue.svg)](https://tauri.app/)
[![Svelte](https://img.shields.io/badge/Svelte-5.0-orange.svg)](https://svelte.dev/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

## ✨ Features

- 🗄️ **Multi-Database Support**: Connect to PostgreSQL, MySQL, SQLite, and MongoDB
- 🔍 **Schema Explorer**: Browse tables, columns, and database structures with tree view
- 📝 **SQL Editor**: Monaco-powered editor with JetBrains Mono font and syntax highlighting
- ⚡ **Fast Query Execution**: Execute SQL queries and view results instantly
- 🎨 **IDE-Inspired UI**: JetBrains DataGrip-inspired interface with professional styling
- 🌙 **Dark Mode**: Full dark mode support with smooth transitions
- 🔒 **Secure**: Built with Tauri for maximum security
- 💻 **Cross-Platform**: Works on macOS, Windows, and Linux
- 🎯 **Collapsible Sidebar**: Space-efficient layout with collapsible panels
- 📊 **Tabbed Results**: Organized results and messages in tabbed interface

## 🚀 Quick Start (Vue + Quasar frontend)

### Prerequisites

- Node.js (v18 or higher)
- Rust (latest stable)
- npm

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/nebula.git
cd nebula
```

2. Install dependencies

```bash
npm install
```

3. Run in development mode (frontend + Tauri)

This project runs a Vite dev server on port 1420 to match Tauri's devUrl.

```bash
# start the frontend dev server
npm run dev

# in another terminal, run tauri dev (optional — runs both in many setups)
npm run tauri
```

4. Build for production

```bash
npm run build
npm run tauri build
```

## 📖 Usage

### Connecting to a Database

1. Click the **"New Connection"** button in the left sidebar
2. Fill in the connection details:
   - **Connection Name**: A friendly name for your connection
   - **Database Type**: Select from PostgreSQL, MySQL, SQLite, or MongoDB
   - **Connection URL**: Your database connection string
3. Click **"Connect"**

The interface features:
- **Left Sidebar**: Collapsible panel for connections and schema exploration
- **Top Toolbar**: Connection status, execute button, and dark mode toggle
- **Query Editor**: Full-featured Monaco editor for writing SQL
- **Bottom Panel**: Tabbed interface for results and messages

### Connection String Examples

**PostgreSQL:**
```
postgres://username:password@localhost:5432/database_name
```

**MySQL:**
```
mysql://username:password@localhost:3306/database_name
```

**SQLite:**
```
sqlite://path/to/database.db
```

**MongoDB:**
```
mongodb://localhost:27017
```

### Exploring Your Database

- Click on a connection to view its tables
- Expand tables to see columns and their data types
- Click on a table to auto-generate a SELECT query

### Running Queries

1. Write your SQL query in the editor
2. Click **"Execute Query"** or use `Cmd/Ctrl + Enter`
3. View results in the results panel below

## 🏗️ Architecture

Nebula is built with a modern tech stack:

### Frontend
- **Svelte 5**: Reactive UI framework
- **SvelteKit**: Application framework
- **Flowbite Svelte**: UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **Monaco Editor**: VS Code's editor for SQL

### Backend
- **Rust**: High-performance backend
- **Tauri 2**: Desktop application framework
- **SQLx**: SQL toolkit and query builder
- **MongoDB Driver**: Official MongoDB Rust driver
- **Tokio**: Async runtime

## 📦 Project Structure

```
nebula/
├── src/                      # Frontend source
│   ├── lib/
│   │   ├── api/              # API layer for Tauri commands
│   │   └── components/       # Svelte components
│   └── routes/               # SvelteKit routes
├── src-tauri/                # Rust backend
│   └── src/
│       ├── db/               # Database management
│       │   └── manager.rs    # Connection pooling and queries
│       ├── commands.rs       # Tauri commands
│       ├── lib.rs            # Main library
│       └── main.rs           # Entry point
├── static/                   # Static assets
└── package.json
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Build frontend
- `npm run preview` - Preview production build
- `npm run tauri dev` - Run Tauri in development mode
- `npm run tauri build` - Build Tauri application
- `npm run check` - Run Svelte type checking

### Adding New Database Drivers

To add support for a new database:

1. Add the driver dependency in `src-tauri/Cargo.toml`
2. Extend the `DbPool` enum in `src-tauri/src/db/manager.rs`
3. Implement connection methods in `DbManager`
4. Update the commands in `src-tauri/src/commands.rs`
5. Add the database type to the frontend in `ConnectionManager.svelte`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - For the amazing desktop app framework
- [Svelte](https://svelte.dev/) - For the reactive UI framework
- [Flowbite](https://flowbite.com/) - For the beautiful UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - For the powerful code editor
- [SQLx](https://github.com/launchbadge/sqlx) - For the excellent SQL toolkit

## 🐛 Known Issues

- MongoDB query execution is currently limited (contributions welcome!)
- Some database-specific features may not be available for all drivers

## 🗺️ Roadmap

- [ ] Query history and favorites
- [ ] Export results to CSV/JSON
- [ ] Visual query builder
- [ ] Database comparison tools
- [ ] SSH tunnel support
- [ ] Multi-tab query editor
- [ ] Stored procedures and functions explorer
- [ ] Database migration tools

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

<div align="center">
Made with ❤️ using Tauri, Svelte, and Rust
</div>
