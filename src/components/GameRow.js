import React from 'react';

function GameRow(props) {
    return(
        <tr>
            <td>{props.data.uuid}</td>
            <td>Pour combien {props.data.question}</td>
            <td>Pour {props.data.howMany}</td>
            <td>{props.data.firstPlayer} - {props.data.secondPlayer}</td>
            <td>{props.data.status}</td>
            <td><button onClick={() => props.removeGame(props.data.uuid)}>Supprimer</button></td>
        </tr>
    )
}

export default GameRow;