		//construct
	function Note(note, duration, longer, sharp, octave){
		this.note = note;
		this.sharp = sharp || false;
		this.octave = octave || 1;
		this.duration = duration || 2;
		this.longer = longer || false;
	}
		//consts
	Note.prototype.MAX_OCTAVS = 3;
	Note.prototype.MIN_DURATION = 5; // 1/32
	Note.prototype.KEY = {
			'c': '1', 'd': '2', 'e': '3', 'f': '4', 'g': '5', 'a': '6', 'b': '7', 'h': '7',
			'-': '0', 'p': '0',
			'sharp' 		:'#',
			'longer'		:'.',
			'changeOctave'	:'*',
			'toDouble'		:'8',
			'toHalf'		:'9'
		};

		//methods
	Note.prototype.toButton = function(prev){
		var result = this.KEY[this.note];
		if (this.longer)
			result += this.KEY.longer;
		if (this.sharp)
			result += this.KEY.sharp;
		var count = (this.octave<prev.octave)
						?this.octave-prev.octave+this.MAX_OCTAVS
						:this.octave-prev.octave;
		for(var i = 0; i<count; i++)
			result += this.KEY.changeOctave;
		var tmp = prev.duration;
		if ((tmp-this.duration<=Math.floor(this.MIN_DURATION/2) && tmp-this.duration>0) || 
			(tmp-this.duration+this.MIN_DURATION+1<=Math.floor(this.MIN_DURATION/2) && this.duration-tmp>0))
			while(tmp != this.duration){
				result += this.KEY.toHalf;
				tmp--;
				if (tmp<0)
					tmp = this.MIN_DURATION;
			}
		else
			while (tmp != this.duration){
				result += this.KEY.toDouble;
				tmp++;
				if (tmp>this.MIN_DURATION)
					tmp = 0;
			}
		return result;
	}

	Note.prototype.toTrueNote = function(){
		if (['b', 'h'].indexOf(this.note)>=0 && this.sharp == true){
			this.note = 'c';
			this.sharp = false;
		}
		else if (this.note == 'e' && this.sharp == true){
			this.note = 'f';
			this.sharp = false;
		}
	}

	window.addEventListener('load', function(){
		//onload
		var form = document.forms[0];

		form.addEventListener('submit', function(e){
			var s = form.notes.value.toLowerCase().trim(),
			separator = form.separator.value;
			var duration,
				octave,
				sharp = false,
				longer = false,
				note;
			var	count = 0;
			var result = '';

			var cur = new Note(),
			prev= new Note();

			for(var i = 0; i<s.length; i++){
				if (s[i] >= '0' && s[i] <= '9'){
					var tmp = s[i];
					if (s[i+1] >= '0' && s[i+1] <= '9'){
						tmp += s[i+1];
						i++;
					}
					tmp *= 1;
					if (cur.note)
						cur.octave = tmp;
					else
						cur.duration = Math.round(Math.log2(tmp));
				}
				else if (s[i] == '#')
					cur.sharp = true;
				else if (s[i] == '.')
					cur.longer = true;
				else if (s[i] >= 'a' && s[i] <= 'h')
					cur.note = s[i];
				else if (s[i] == '-' || s[i] == 'p')
					cur.note = s[i];
				else if (cur.note != undefined){
					cur.toTrueNote();
					result += cur.toButton(prev) + separator;
					

					prev.duration = cur.duration;
					prev.octave = cur.octave;

					cur.sharp = false;
					cur.longer = false;
					cur.note = undefined;
					count++;
				}
			}

			if (cur.note != undefined){
				count++;
				cur.toTrueNote();
				result += cur.toButton(prev);
			}
			var empty = (count>50)?'0':(50-count);
			alert("Использовано "+count+" нот(ы)\nДолжно остаться "+empty+" нот(ы)");
			form.buttons.value = result;
			e.preventDefault();
		})
	});