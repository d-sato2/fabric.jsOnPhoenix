defmodule FlaskOnPhoenix.RoomChannel do
  use Phoenix.Channel

  def join("rooms:lobby", auth_msg, socket) do
    {:ok, socket}
  end
  def join("rooms:" <> _private_room_id, _auth_msg, socket) do
    {:error, %{reason: "unauthorized"}}
  end

  def handle_in("sticky:create", %{"left" => x, "top" => y}, socket) do
    broadcast! socket, "sticky:create", %{left: x, top: y}
    {:noreply, socket}
  end

  def handle_in("sticky:modified", %{"id" => a, "left" => b, "top" => c, "width" => d, "height" => e, "scaleX" => f, "scaleY" => g}, socket) do
    broadcast! socket, "sticky:modified", %{id: a, left: b, top: c, width: d, height: e, scaleX: f, scaleY: g}
    {:noreply, socket}
  end
end