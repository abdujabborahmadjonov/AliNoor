# AliNoor MCP server

Lets an MCP client (Claude Desktop, Claude Code, or any other) read and edit
your AliNoor daily schedule: the tasks you hang after each prayer. It signs in
as you and works on the same synced data as the website and phone app, so a
change made here shows up there the next time the app loads.

## Tools

| Tool | What it does |
| --- | --- |
| `get_today` | Today's planning day, your city, prayer times and tasks |
| `get_prayer_times` | Prayer times for any planning day |
| `list_tasks` | The tasks of one day, with their ids |
| `add_task` | Add a task after a prayer (Maghrib, Isha, Fajr, Dhuhr, Asr) |
| `update_task` | Rename, move to another prayer or day, or mark done |
| `delete_task` | Remove a task |

`date` is optional on every tool and defaults to today. A day runs from
Maghrib to Maghrib and is named by the date it ends on, so the "after Maghrib"
and "after Isha" tasks of 18 November happen on the evening of the 17th.

## Setup

1. Install dependencies once, in `alinoor/`:

   ```bash
   npm install
   ```

2. Your account needs an email and password. If you signed up with Google,
   set a password with "Forgot password" on the login page first.

3. Add the server to your client. For Claude Desktop, in
   `claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "alinoor": {
         "command": "npm",
         "args": ["run", "-s", "mcp", "--prefix", "/path/to/AliNoor/alinoor"],
         "env": {
           "ALINOOR_EMAIL": "you@example.com",
           "ALINOOR_PASSWORD": "your-password"
         }
       }
     }
   }
   ```

   For Claude Code:

   ```bash
   claude mcp add alinoor \
     -e ALINOOR_EMAIL=you@example.com -e ALINOOR_PASSWORD=your-password \
     -- npm run -s mcp --prefix /path/to/AliNoor/alinoor
   ```

Then ask things like "what's on my schedule today?" or "plan tomorrow: Quran
after Fajr, two hours of study, gym after Asr".

## Notes

- The password lives only in your client's config on your machine. The server
  uses Supabase's public client key, and row-level security limits it to your
  own rows.
- If the website is open while you edit here, reload it before changing tasks
  there; otherwise the open tab can save its older copy over these edits.
