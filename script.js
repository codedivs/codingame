let question = document.getElementById('question_holder');
let correct_answers = document.getElementById('answer_to_questions');
let shuffled_answers = document.getElementById('answers_options');
let data = [];
let correct_answer_format = [];

fetch('quesstions.json').
	then(r = r.ok ? r.json() : Promise.reject('Response not OK')).
	then(data =>  {
		data = data;
		data.forEach(item => {
			item.question = question;
			items.codes = correct_answer_format;
			shuffled_answers = shuffleanswers(item.codes);
		

			first touched, first move top hierachy, 
			second touched, second move to second div

function shuffleanswers(array_to_shuffle) {
	for(var i = array.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * i + 1));
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
	}
}
function allow_user_drop_answers(
