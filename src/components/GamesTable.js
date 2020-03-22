import React from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from "apollo-boost";

import GameRow from './GameRow';

const ALL_GAMES = gql`
query {
  allGames {
    edges {
      node {
        uuid,
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
}
`;

const DELETE_GAME = gql`
mutation DeleteGame($gameId: Int!) {
    deleteGame(gameId: $gameId) {
      ok
    }
}
`

function GamesTable() {
  const { loading: allGamesLoading, error: allGamesError, data } = useQuery(ALL_GAMES);

  const [ deleteGame, { loading: deleteGameLoading, error: deleteGameError } ] = useMutation(DELETE_GAME, {
    refetchQueries: [{ query: ALL_GAMES }],
    awaitRefetchQueries: true
  });

  const removeGame = (uuid) => {
    deleteGame({
        variables: {
            gameId: parseInt(uuid)
        }
    })
  }


  if (allGamesLoading | deleteGameLoading) return <p>Loading...</p>;
  if (allGamesError | deleteGameError) return <p>Error :(</p>;

  const createTable = (edges) => {
    let table = [];

    for (const edge of edges) {
      table.push(
      <GameRow 
        key={edge.node.uuid}
        data={edge.node}
        removeGame={removeGame}
      />
      );
    }

    return table;
  };

  return(
    <table>
      <thead>
        <tr>
          <td>Id</td>
          <td>Question</td>
          <td>Pour combien ?</td>
          <td>Joueurs</td>
          <td>Status</td>
          <td>Action</td>
        </tr>
      </thead>
      <tbody>
        {createTable(data.allGames.edges)}
      </tbody>
    </table>
  );
}

export default GamesTable;