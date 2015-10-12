defmodule Chat.WhiteboardChannelTest do
  use Chat.ChannelCase

  alias Chat.WhiteboardChannel

  setup do
    {:ok, _, socket} =
      socket("user_id", %{some: :assign})
      |> subscribe_and_join(WhiteboardChannel, "whiteboards:public")

    {:ok, socket: socket}
  end

  test "replies mouseover with status ok", %{socket: socket} do
    ref = push socket, "mouseover", %{"x" => 1,"y" => 3}
    assert_reply ref, :ok
  end

  test "broadcasts mouseover with data to whiteboards:public", %{socket: socket} do
    push socket, "mouseover", %{"x" => 1, "y" => 3}
    assert_broadcast "mouseover", %{"x" => 1, "y" => 3}
  end

  test "broadcasts clicks to clients", %{socket: socket} do
    broadcast_from! socket, "broadcast", %{"x" => "1", "y" => 2, "w" => 2, "color" => "rgba(33,44,55,0.8)"}
    assert_push "broadcast", %{"x" => "1", "y" => 2, "w" => 2, "color" => "rgba(33,44,55,0.8)"}
  end
end
