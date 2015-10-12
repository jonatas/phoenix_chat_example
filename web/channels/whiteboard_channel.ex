defmodule Chat.WhiteboardChannel do
  use Phoenix.Channel
  require Logger

  def join("whiteboards:public", payload, socket) do
    {:ok, socket}
  end

  def handle_in(watheva, payload, socket) do
    broadcast socket, watheva, payload
    {:noreply, socket}
  end

  def handle_out(event, payload, socket) do
    push socket, event, payload
    {:noreply, socket}
  end

end
