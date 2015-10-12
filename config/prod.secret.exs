use Mix.Config

# In this file, we keep production configuration that
# you likely want to automate and keep it away from
# your version control system.
config :chat, Chat.Endpoint,
  secret_key_base: "cavvo9VbEAUKgNcElI4D8tOx5uXA6AgcRftfmrMetSwwD7A8OsWFKzGHiMzGalSS"

# Configure your database
config :chat, Chat.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: "postgres",
  password: "postgres",
  database: "chat_prod"
