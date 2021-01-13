import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Question from './Question';
import actions from '../actions';
import Header from './Header';

class GamePage extends React.Component {
  constructor() {
    super();
    this.fetchGame = this.fetchGame.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.start = this.start.bind(this);
    // this.randomOptions = this.randomOptions.bind(this);
    this.state = {
      games: [],
      loading: true,
      timer: 30,
    };
  }

  componentDidMount() {
    const { token } = this.props;
    // const recoveredToken = localStorage.getItem('token');
    this.fetchGame(token);
  }

  handleClick() {
    const {
      changeQuestion,
      questionNumber,
      history,
      resetClasses,
      enableOptions } = this.props;
    const maxQuestionNumber = 4;
    resetClasses();
    if (questionNumber < maxQuestionNumber) {
      changeQuestion();
      this.start();
      enableOptions();
    } else {
      history.push('/feedback');
    }
  }

  start() {
    const oneSecond = 1000;
    const { disableOptions } = this.props;
    const interval = setInterval(() => {
      const { timer } = this.state;
      if (timer > 0) {
        this.setState(({timer: previous}) => ({
          timer: previous - 1,
        }));
      } else {
        clearInterval(interval);
        this.setState({
          timer: 30,
        });
        disableOptions();
      }
    }, oneSecond);
  }

  async fetchGame(token) {
    try {
      const fetchAPI = await fetch(`https://opentdb.com/api.php?amount=5&token=${token}`);
      const gameInfo = await fetchAPI.json();
      this.setState({
        games: gameInfo.results,
        loading: false,
      });
      this.start();
    } catch (error) {
      return error;
    }
  }

  render() {
    const { games, loading } = this.state;
    const { questionNumber } = this.props;
    if (loading) {
      return <p>Loading...</p>;
    }
    const {
      category,
      question,
      correct_answer: correctAnswer,
      incorrect_answers: incorrectAnswers,
    } = games[questionNumber];
    const {timer} = this.state;
    return (
      <div>
        <Header />
        <Question
          category={ category }
          question={ question }
          correctAnswer={ correctAnswer }
          incorrectAnswers={ incorrectAnswers }
          timer={ timer }
        />
        <button
          type="button"
          data-testid="btn-next"
          onClick={ this.handleClick }
        >
          Próxima
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  token: state.login.token,
  questionNumber: state.gamepage.currentQuestion,
});

const mapDispatchToProps = (dispatch) => ({
  changeQuestion: () => dispatch(actions.changeQuestionNumber()),
  resetClasses: () => dispatch(actions.resetClasses()),
  startTimer: () => dispatch(actions.startTimer()),
  resetTimer: () => dispatch(actions.resetTimer()),
  disableOptions: () => dispatch(actions.disableOptions()),
  enableOptions: () => dispatch(actions.enableOptions()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GamePage);

GamePage.propTypes = {
  token: PropTypes.string.isRequired,
  changeQuestion: PropTypes.func.isRequired,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  questionNumber: PropTypes.number.isRequired,
  resetClasses: PropTypes.func.isRequired,
  enableOptions: PropTypes.func.isRequired,
  startTimer: PropTypes.func.isRequired,
  resetTimer: PropTypes.func.isRequired,
  disableOptions: PropTypes.func.isRequired,
};
