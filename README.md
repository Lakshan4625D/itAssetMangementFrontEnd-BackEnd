# IT Asset Manager

**Short description**

A lightweight, Python-based network asset discovery and inventory tool that scans your local network using **nmap**, collects device details (SNMP, HTTP banners, WinRM/SSH where available), and stores results in a MySQL database. This repository contains the scanner backend, web UI, and supporting modules.

---

## Quick start (Windows / macOS / Linux)

1. **Install prerequisites**

   * Install **Nmap** (required). Make sure the `nmap` binary is available in your `PATH`.

     * Windows: download from [https://nmap.org/download.html](https://nmap.org/download.html) and run the installer.
     * macOS: `brew install nmap` (if using Homebrew) or download package.
     * Linux: `sudo apt-get install nmap` (Debian/Ubuntu) or use your distro package manager.

   * Install **Python 3.10+** (a recent 3.x release). Ensure `python` / `python3` points to the interpreter.

   * Install **MySQL** (or MariaDB compatible) and make sure you can connect with a user that has permission to create databases/tables.

2. **Get the project files**

   * To clone from GitHub:

   ```bash
   git clone https://github.com/Lakshan4625D/itAssetMangementFrontEnd-BackEnd.git
   ```

   * Or download the ZIP from GitHub and extract it. Then `cd` into the extracted folder.

3. **Create and activate a Python virtual environment** (recommended)

   ```bash
   python3 -m venv venv
   # macOS / Linux
   source venv/bin/activate
   # Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   # Windows (cmd)
   .\venv\Scripts\activate.bat
   ```

4. **Install Python dependencies**

   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

5. **Create the database**

   The SQL schema for the project is provided in the repository at:

   ```
   /db/network_scanner.sql
   ```

   Import it into MySQL using a user with the appropriate privileges:

   ```bash
   mysql -u root -p < db/network_scanner.sql
   ```

   Or, from within a MySQL client:

   ```sql
   SOURCE /full/path/to/db/network_scanner.sql;
   ```

6. **Configure database credentials**

   Edit the database configuration file located at:

   ```
   /backend/db/database.py
   ```

   Update the DB host, username, password, port and database name to match your environment. Example variables you may find or need to set:

   ```python
   DB_HOST = "localhost"
   DB_PORT = 3306
   DB_USER = "your_db_user"
   DB_PASSWORD = "your_password"
   DB_NAME = "network_scanner"
   ```


7. **Verify nmap is usable**

   Run a simple nmap command to confirm the binary is accessible:

   ```bash
   nmap -v -sn 127.0.0.1
   ```

   If that works, the scanner modules that wrap nmap should be able to call it.

8. **Run the application**

    To run backend:  
    ```bash
    uvicorn backend.app.main_app:app --reload --host 0.0.0.0 --port 8000
    ```

    To run frontend:  
    ```bash
    cd frontend
    npm run dev
    ```

---

## Notes & troubleshooting

* **Permissions & firewall**: Nmap may require elevated permissions for some scan types. If a scan fails, try running with appropriate privileges or choose a less intrusive scan option.
* **nmap not found**: If the code errors saying `nmap` is not found, ensure the `nmap` executable is in your PATH or provide the full path to the nmap binary in any config option the project exposes.
* **Database connection errors**: Double-check credentials in `/backend/db/database.py` and that your MySQL server is running and accepting TCP connections. If MySQL is on another host, ensure that host and port are reachable and allowed by firewall.
* **Requirements installation issues**: If `pip install -r requirements.txt` fails, update pip (`pip install --upgrade pip`) and re-run. On some platforms you might need to install system dependencies (e.g., build tools) for certain Python packages.
* **Log files & debug**: Check the project `logs/` directory (if present) and the console output for detailed error messages.

---

## Contributing

Contributions welcome! Typical workflow:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit changes and push
4. Create a pull request with a description of the change

Please include tests for any non-trivial new behavior.

---

## Contact

If you need help, open an issue in the repo or contact the maintainer: `lakshan4625d@example.com`.

---

*Last updated:* `2025-10-12`



                  

