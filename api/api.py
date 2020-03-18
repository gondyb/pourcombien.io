from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
import os, enum

import graphene
from graphene_sqlalchemy import SQLAlchemyObjectType, SQLAlchemyConnectionField

from flask_graphql import GraphQLView

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.debug = True

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'data.sqlite')
app.config['SQLALCHEMY_COMMIT_ON_TEARDOWN'] = True
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db = SQLAlchemy(app)

class GameStatusEnum(enum.Enum):
    created = 1
    joined = 2
    played = 3
    reversed = 4
    ended = 5

class Game(db.Model):
    __tablename__ = 'game'

    uuid = db.Column(db.Integer, primary_key=True)
    first_player = db.Column(db.String(256))
    second_player = db.Column(db.String(256))
    question = db.Column(db.Text)
    how_many = db.Column(db.Integer)
    status = db.Column(db.Enum(GameStatusEnum), default=GameStatusEnum.created)
    choices = relationship("Choice", back_populates="game")

    def __repr__(self):
        return '<Game %r>' % self.uuid

class Choice(db.Model):
    __tablename__ = 'choice'

    uuid = db.Column(db.Integer, primary_key=True)
    player_number = db.Column(db.Integer)
    number_selected = db.Column(db.Integer)
    game_id = db.Column(db.Integer, db.ForeignKey('game.uuid'))
    game = relationship("Game", back_populates="choices")

    def __repr__(self):
        return '<Choice %r>' % self.uuid

class GameObject(SQLAlchemyObjectType):
    class Meta:
        model = Game
        interfaces = (graphene.relay.Node, )

class ChoiceObject(SQLAlchemyObjectType):
    class Meta:
        model = Choice
        interfaces = (graphene.relay.Node, )

class Query(graphene.ObjectType):
    node = graphene.relay.Node.Field()
    all_games = SQLAlchemyConnectionField(GameObject)
    all_choices = SQLAlchemyConnectionField(ChoiceObject)

class NewGame(graphene.Mutation):
    class Arguments:
        first_player = graphene.String(required=True)
        question = graphene.String(required=True)

    game = graphene.Field(lambda: GameObject)

    def mutate(self, info, first_player, question):
        game = Game(first_player=first_player, question=question)

        db.session.add(game)
        db.session.commit()

        return NewGame(game=game)

class JoinGame(graphene.Mutation):
    class Arguments:
        uuid = graphene.Int(required=True)
        second_player = graphene.String(required=True)
        how_many = graphene.Int(required=True)

    game = graphene.Field(lambda: GameObject)

    def mutate(self, info, uuid, second_player, how_many):
        game = Game.query.filter_by(uuid=uuid).first()

        game.second_player = second_player
        game.status = GameStatusEnum.joined
        game.how_many = how_many

        db.session.commit()

        return JoinGame(game=game)

class PlayGame(graphene.Mutation):
    class Arguments:
        game_id = graphene.Int(required=True)
        player = graphene.Int(required=True)
        choice = graphene.Int(required=True)

    game = graphene.Field(lambda: GameObject)

    def mutate(self, info, game_id, player, choice):
        game = Game.query.filter_by(uuid=game_id).first()

        choice = Choice(game=game, player_number=player, number_selected=choice)

        db.session.add(choice)

        if (len(game.choices) == 2):
            game.status = GameStatusEnum.played

        if (len(game.choices) == 4):
            game.status = GameStatusEnum.ended

        db.session.commit()

        return PlayGame(game=game)

class ReverseGame(graphene.Mutation):
    class Arguments:
        game_id = graphene.Int(required=True)

    game = graphene.Field(lambda: GameObject)

    def mutate(self, info, game_id):
        game = Game.query.filter_by(uuid=game_id).first()

        game.status = GameStatusEnum.reversed

        db.session.commit()

        return ReverseGame(game=game)

class DeleteGame(graphene.Mutation):
    class Arguments:
        game_id = graphene.Int(required=True)

    ok = graphene.Boolean()

    def mutate(self, info, game_id):
        game = Game.query.filter_by(uuid=game_id).first()

        db.session.delete(game)
        db.session.commit()

        return DeleteGame(ok=True)

class Mutation(graphene.ObjectType):
    new_game = NewGame.Field()
    join_game = JoinGame.Field()
    play = PlayGame.Field()
    reverse = ReverseGame.Field()
    delete_game = DeleteGame.Field()
        
schema = graphene.Schema(query=Query, mutation=Mutation)

@app.route('/')
def index():
    return '<p>Bonjour à tous</p>'

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True
    )
)

if __name__ == '__main__':
    app.run()