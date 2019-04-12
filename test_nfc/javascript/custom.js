jQuery(document).ready(($) => {
	$('input[name=media_type]').click((e) => {
		var $this = $(e.currentTarget)
		if ($this.is(':checked')) {
			if ($this.attr('id') == 'media_type_solid') {
				$('#peripheral_type_group').show()
				$('#syringe_group').hide()
				showPlate()
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
	
	
	var showPlate = () => {
		$('.form-row.plate').hide()
		if ($('#media_type_solid').is(':checked')) {
			var plate = $('#peripheral_type').val()
			$('#' + plate).show()
		}
	}
	$('#peripheral_type').change(showPlate).change()
})

var $c = (t) => {
	console.log(t)
}

