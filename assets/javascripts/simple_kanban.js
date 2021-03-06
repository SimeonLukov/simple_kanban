$(function() {
  $(".kanban_card").disableSelection();
  $(".kanban_card").draggable();
  $(".status_column").droppable({
    drop: function( event, ui ) {
      var column = $(this);
      var kanban_card = ui.draggable;
      var issue_href = kanban_card.find('a.issue_link')[0].href;
      var issue_id = kanban_card.data('issue_id');
      var new_issue_status_id = $(this).data('issue_status_id');
      var old_issue_status = kanban_card.data('issue_status');
      kanban_card.css('top', '').css('left', '');
      $.ajax({
        url: issue_href,
        async: false,
        data: { issue: { status_id: new_issue_status_id } },
        dataType: 'json',
        type: 'PUT',
        success: function(jq_xhr, text_status, error_thrown) {
          // check whether status has really changed because when user has not been given permission for this workflow,
          // Redmine ignores status change but saves the issue and returns 200 OK
          $.get('/issues/' + issue_id + '.json',
                {key: redmine_api_key},
                function(data) {
                  var issue = data.issue
                  if (issue.status.id == new_issue_status_id && new_issue_status_id != old_issue_status.id) {
                    $.jGrowl("Статусът на #" + issue_id + " беше сменен от '" + old_issue_status.name + "' на '" + issue.status.name +"'")
                    insert_kanban_card(column, kanban_card, issue)
                  } else if (new_issue_status_id != old_issue_status.id) {
                    alert("Статусът на #" + issue_id + "не може да бъде сменен на '" + issue.status.name +"',\nтъй като не сте управомощен за това.")
           }});
        },
        error: function(jq_xhr, text_status, error_thrown) { alert("Статусът на #" + issue_id + " не беше сменен.") }
      });
   }
 })
 $(".status_column").each( function(){ sort_kanban_cards($(this)) })
 $(".status_column").css('width', document.documentElement.clientWidth / $('table.kanban').first().find('td.status_column').size() )
 $('.closed_status').click(function() {
   $('.closed_status').hide()
   $('.open_status').css('width', document.documentElement.clientWidth / $('table.kanban').first().find('td.open_status').size() )
  })
})

// Arguments are jQuery objects
function insert_kanban_card(column, kanban_card, issue) {
  column.append(kanban_card)
  kanban_card.data('issue_status', issue.status)
  if (column.hasClass('open_status')) { sort_kanban_cards(column) }
}

function sort_kanban_cards(column) {
  column.find('.kanban_card').tsort({data:'issue_tracker_position'}, {data:'issue_priority_position', order: 'desc'}, {data:'issue_id'});
}
