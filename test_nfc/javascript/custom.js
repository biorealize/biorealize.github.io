jQuery(document).ready(($) => {
	$('input[name=media_type]').click((e) => {
		var $this = $(e.currentTarget)
		if ($this.is(':checked')) {
			if ($this.attr('id') == 'media_type_solid') {
				$('#peripheral_type_group').show()
				$('#syringe_group').hide()
				switchPlate()
				var table = $('.plate').filter((i, d) => {
					return $(d).is(':visible')
				})
				table.find('input').eq(0).focus()
				//$('.plate').is(':visible').find('input').eq(0).focus()
			} else {
				$('#peripheral_type_group, .form-row.plate').hide()
				$('#syringe_group').show()
			}
		}
	})
	
	
	var switchPlate = () => {
		$('.form-row.plate').hide()
		if ($('#media_type_solid').is(':checked')) {
			var plate = $('#peripheral_type').val()
			$('#' + plate).show()
		}
	}
	$('#peripheral_type').change(switchPlate).change()
	
	$('#submit_nfc_form').submit((e) => {
		e.preventDefault()
		var experiment = {}, nfc_obj = {}
		var $this = $(e.currentTarget)
		var fields = ['id', 'client', 'location', 'start_time', 'duration', 'target_temperature', 'imaging_frequency', ]
		for (var i = 0; i < fields.length; i++) {
			experiment[fields[i]] = $this.find('#' + fields[i]).val()
		}
		if ($this.find('input[name=media_type]:checked').val() == 'solid') {
			experiment.peripheral_type = $this.find('#peripheral_type').val()
			var load = {}
			var $plate = $this.find('.form-row.plate:visible').find('table')
			$plate.find('tr').each((i, row) => {
				var chr = String.fromCharCode(65 + i)
				$(row).find('td').each((j, td) => {
					load[chr + j] = $(td).find('input[type=text]').val()
				})
			})
			experiment.load = load
		} else {
			experiment.syringe = $this.find('#syringe').val()
		}
		nfc_obj.experiment = experiment
		$('#json_sent').val(JSON.stringify(nfc_obj))
	})
})

var $c = (t) => {
	console.log(t)
}

/*
{ "experiment" :
	{
	id: 79E4464,
	"client" : "Lacolombe",
	"location" : 19102,
	"start_time:" : Monday08April2019_09/37/28AM,
	"duration" : 3600,
	"peripheral_type" : "6_well_plate",
	"load":
	     [
{
		"A1" : organismA",
		"A2" : organismB",
		"A3" : organismC",
		"B1" : organismD",
		"B2" : organismE",
		"B3" : organismF",  
		}
     ],
	"target_temperature" : 37,
	"imaging_frequency" : 3600,
	"end_time": <filled when completed>
	}
}
*/