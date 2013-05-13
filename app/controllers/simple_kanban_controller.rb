class SimpleKanbanController < ApplicationController
  unloadable

  before_filter :find_project, :authorize
  
  helper :projects, :versions
  
  def index
    @issue_statuses = IssueStatus.sorted
  end
  
  private

    def find_project
      # @project variable must be set before calling the authorize filter
      @project = Project.find(params[:project_id])
    end
end
