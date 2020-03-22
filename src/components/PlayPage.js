import React, { useState } from 'react';
import { useParams, generatePath } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import WinnerComponent from './WinnerComponent';
import PlayComponent from './PlayComponent';
import JoinGameForm from './JoinGameForm';

const GET_GAME = gql`
query fetchGame($id: ID!) {
    node(id: $id) {
      ...on GameObject {
        id,
        firstPlayer,
        secondPlayer,
        howMany,
        question,
        status,
        choices {
            edges {
              node {
                playerNumber,
                numberSelected
              }
            }
          }
      }
    }
  }
`;

const JOIN_GAME = gql`
mutation joinGame($id: ID!, $secondPlayer: String!, $howMany: Int!) {
    joinGame(
      id: $id, 
      secondPlayer: $secondPlayer,
      howMany: $howMany
    ){
      game {
        firstPlayer,
        secondPlayer,
        question,
        howMany,
        status
      }
    }
  }
`;

const PLAY = gql`
mutation play($id: ID!, $player: Int!, $choice: Int!) {
    play(
      gameId: $id, 
      player: $player, 
      choice: $choice
    ){
      game {
        firstPlayer,
        secondPlayer,
        question,
        howMany,
        status,
        choices {
          edges {
            node {
              playerNumber,
              numberSelected
            }
          }
        }
      }
    }
  }
`;

const REVERSE_GAME = gql`
mutation reverseGame($id: ID!) {
    reverse(gameId: $id) {
      game {
        status
      }
    }
  }
`;

function PlayPage(props) {
    let currentPlayer = 1;

    const { id, player } = useParams();

    if (player === undefined) {
        currentPlayer = 2;
    }
    
    const [hasPlayed, setHasPlayed] = useState(false);

    const [previousStatus, setPreviousStatus] = useState(null);

    const { loading: gameLoading, error: gameError,data } = useQuery(GET_GAME, {
        variables: {
            id: id
        },
        pollInterval: 1000
    });

    const [joinGame] = useMutation(JOIN_GAME);

    const [play] = useMutation(PLAY);

    const [reverseGame] = useMutation(REVERSE_GAME);

    if (gameLoading) return "Chargement ...";

    if (gameError) return "Erreur :(";

    if (currentPlayer === 2 && !data.node.howMany) return <JoinGameForm 
        game={data.node} 
        joinGame={joinGame} 
    />;

    const chooseNumber = (event) => {
        event.preventDefault();

        setHasPlayed(true);

        play({
            variables: {
                id: id,
                player: currentPlayer,
                choice: event.currentTarget.textContent
            }
        });
    }

    const reverse = () => {
        setHasPlayed(false);

        reverseGame({
            variables: {
                id: id
            }
        });
    };

    switch (data.node.status) {
        case "CREATED":
            if (previousStatus !== "CREATED") setPreviousStatus("CREATED");

            return(
            <div>
                <p>En attente de la connexion d'un autre joueur ...</p>
                <p>Envoie-lui le lien suivant : http://82.65.25.159{generatePath("/play/:id", {
                    id: id
                })}</p>
            </div>
            );
        case "JOINED":
            if (previousStatus !== "JOINED") setPreviousStatus("JOINED");
            if (hasPlayed) {
                return (
                    <>
                    <p>En attente de l'adversaire ...</p>
                    </>
                );
            }

            return(
            <>
                <p>Choisis un nombre entre 1 et {data.node.howMany} !</p>
                <PlayComponent chooseNumber={chooseNumber} game={data.node}/>
            </>
            );
        case "PLAYED":
            if (previousStatus !== "PLAYED") setPreviousStatus("PLAYED");

            return(<WinnerComponent id={id} reverse={reverse} game={data.node} currentPlayer={currentPlayer}/>);
        case "REVERSED":
            if (previousStatus === "PLAYED") {
                setHasPlayed(false);
            }

            if (previousStatus !== "REVERSED") setPreviousStatus("REVERSED");

            if (hasPlayed) {
                return (
                    <>
                    <p>La partie a été reverse par {data.node.secondPlayer} !</p>
                    <p>En attente de l'adversaire ...</p>
                    </>
                );
            }

            return(
            <>
                <p>La partie a été reverse par {data.node.secondPlayer} !</p>
                <p>Choisis un nombre entre 1 et {data.node.howMany - 1} !</p>
                <PlayComponent chooseNumber={chooseNumber} game={data.node}/>
            </>
            );
        case "ENDED":
            if (previousStatus !== "ENDED") setPreviousStatus("ENDED");

            return(<WinnerComponent id={id} reverse={reverse} game={data.node} />);
        default:
            return(<p>Error lol : status {data.node.status}</p>);
    }

}

export default PlayPage;

