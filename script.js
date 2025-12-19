let question = document.getElementById('question_holder');
let correct_answers = document.getElementById('answer_to_questions');
let shuffled_answers = document.getElementById('answers_options');
let data = [];
let loaded_data = [];
let codes = [];
let shuffled = [];

fetch('quesstions.json').
	then(response => response.json()).
	then(data =>	{
		loaded_data = data;
		data.forEach(item => {
			question.innerHTML = item.question;
			shuffled_answers_copy = [...item.codes];

			shuffled = shuffleanswers(shuffled_answers_copy);
			shuffled.forEach(answer => {
				const divs = document.createElement('div');
				divs.textContent = answer;
				shuffled_answers.appendChild(divs);
			});
	)}).
	catch(error => console.error('Error', error);
	/**
		data => loaded_questions

	loaded_questions.forEach(item =>
	item.question = question.innerHTML;
	item.codes = correct_answer_format;
	correct_answer_format = shuffled_answers_copy;
	shuffled_answers = shuffleanswers(shuffled_answers_copy;
	shuffled_answers.innerHTML;
	
	)
	).
	catch(error => console.error('Error', error));
	**/
	

function shuffleanswers(array) {
	const a = [...array];
	for(let i = a.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * i + 1));
		var temp = a[i];
		a[i] = a[j];
		a[j] = temp;
	}
}

