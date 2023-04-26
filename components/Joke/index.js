import useSWR from "swr";
import { useState } from "react";
import { useRouter } from "next/router";
import JokeForm from "../JokeForm";
import Link from "next/link";
import useSWRMutation from "swr/mutation";

async function sendRequest(url, { arg }) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  const data = await response.json();

  console.log(data);
}

export default function Joke() {
  const [isEditMode, setIsEditMode] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useSWR(`/api/jokes/${id}`);
  const { trigger } = useSWRMutation(`/api/jokes/${id}`, sendRequest);

  async function handleEdit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const jokeData = Object.fromEntries(formData);

    await trigger(jokeData);
    setIsEditMode(false);
  }

  async function handleDelete() {
    const response = await fetch(`/api/jokes/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      router.push("/");
    }
  }

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!data) return;

  return (
    <>
      <small>ID: {id}</small>
      <h1>{data.joke} </h1>
      <div>
        <button
          onClick={() => {
            setIsEditMode(!isEditMode);
          }}
        >
          <span role="img" aria-label="A pencil">
            ✏️
          </span>
        </button>
        <button onClick={handleDelete} disabled={isEditMode}>
          <span role="img" aria-label="A cross indicating deletion">
            ❌
          </span>
        </button>
      </div>
      {isEditMode && (
        <JokeForm onSubmit={handleEdit} value={data.joke} isEditMode={true} />
      )}
      <Link href="/">Back to all</Link>
    </>
  );
}
