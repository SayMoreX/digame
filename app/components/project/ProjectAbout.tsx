import * as React from "react";
import { observer, Provider } from "mobx-react";
import TextFieldEdit from "../TextFieldEdit";
import { TextField } from "../../model/Field";
import DateFieldEdit from "../DateFieldEdit";
import { Project } from "../../model/Project";
import { FieldSet } from "../../model/FieldSet";

export interface IProps {
  project: Project;
  fields: FieldSet;
}
@observer
export default class ProjectAbout extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    return (
      <form className={"projectAboutForm"}>
        <TextFieldEdit text={this.props.fields.getTextField("title")} />
        <TextFieldEdit text={this.props.fields.getTextField("iso639Code")} />
        <TextFieldEdit
          className={"text-block"}
          text={this.props.fields.getTextField("projectDescription")}
        />
      </form>
    );
  }
}
