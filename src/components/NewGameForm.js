import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';
import { gql } from "apollo-boost";
import {
    Redirect
  } from 'react-router-dom';

const NEW_GAME = gql`
mutation NewGame($firstPlayer: String!, $question: String!) {
    newGame(
      firstPlayer: $firstPlayer,
      question: $question
    ) {
      game {
        id,
        firstPlayer,
        question,
        status
      }
    }
  }
`;

function NewGameForm() {

    const [name, setName] = useState("Dupond");
    const [question, setQuestion] = useState("tu t'allonges tout de suite ?");

    const [newGame, { data }] = useMutation(NEW_GAME);
    
    const handleSubmit = (e) => {
        e.preventDefault();

        newGame({
            variables: {
                firstPlayer: name,
                question: question
            }
        })
    }

    return(
        <>
        {data ? <Redirect to={"/play/" + data.newGame.game.id + "/first"} /> : null}
        <form onSubmit={handleSubmit}>
            <div>
                <label>Ton nom :</label>
                <br />
                <input type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div>
                <label>Pour combien </label>
                <input type="text" value={question} onChange={e => setQuestion(e.target.value)} />
            </div>

            <input type="submit" value="Envoyer" />
        </form>
        </>
    )
}

export default NewGameForm