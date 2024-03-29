import axios from 'axios'
import React, {useContext, useState} from 'react'

const table = {
    sports: 21, history: 23, politics: 24,
}

const API_ENDPOINT = 'https://opentdb.com/api.php?'


const AppContext = React.createContext()

const AppProvider = ({children}) => {
    const [waiting, setWaiting] = useState(true)
    const [loading, setLoading] = useState(false)
    const [questions, setQuestions] = useState([])
    const [index, setIndex] = useState(0)
    const [correct, setCorrect] = useState(0)
    const [error, setError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [quiz, setQuiz] = useState({
        amount: 10, category: 'sports', difficulty: 'easy'
    })

    const fetchQuestions = async (url) => {
        setLoading(true);
        setWaiting(false);

        const {data: {results}} = await axios.get(url);

        if (results.length > 0) {
            setQuestions(results)
            setLoading(false)
            setWaiting(false)
            setError(false)
        } else {
            throw new Error('no questions found');
        }
    }

    const nextQuestion = () => {
        setIndex((oldIndex) => {
            const index = oldIndex + 1;
            if (index > questions.length - 1) {
                openModal();
                return 0;
            }
            return index;
        })
    }

    const checkAnswer = (value) => {
        if (value) {
            setCorrect((oldState) => oldState + 1)
        }
        nextQuestion()
    }

    const openModal = () => {
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setWaiting(true)
        setCorrect(0)
        setIsModalOpen(false)
    }

    const handleChange = (e) => {
        const name = e.target.name;
        const value = e.target.value;
        setQuiz({...quiz, [name]: value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const {amount, category, difficulty} = quiz;
        const url = `${API_ENDPOINT}amount=${amount}&category=${table[category]}&difficulty=${difficulty}&type=multiple`;

        try {
            await fetchQuestions(url)
        } catch (e) {
            setWaiting(true)
            setError(true)
            setLoading(false)
        }

    }


    return (
        <AppContext.Provider value={{
            waiting,
            loading,
            questions,
            index,
            correct,
            error,
            isModalOpen,
            nextQuestion,
            checkAnswer,
            closeModal,
            quiz,
            handleChange,
            handleSubmit
        }}>
            {children}
        </AppContext.Provider>
    )
}
// make sure use
export const useGlobalContext = () => {
    return useContext(AppContext)
}

export {AppContext, AppProvider}
