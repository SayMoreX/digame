import * as React from "react";
import { FolderList } from "../FolderList";
import {
  FolderGroup,
} from "../../model/Folder/Folder";
import { FolderPane } from "../FolderPane";
import { observer } from "mobx-react";
import { AuthorityLists } from "../../model/Project/AuthorityLists/AuthorityLists";
import { Project } from "../../model/Project/Project";
import "./ComponentTab.scss";

import SplitPane from "react-split-pane";

interface IProps {
  nameForPersistingUsersTableConfiguration: string;
  folders: FolderGroup;
  folderTypeStyleClass: string;
  columns: string[];
  columnWidths: number[];
  authorityLists: AuthorityLists;
  project: Project;
  folderListButtons?: JSX.Element[];
  fileListButtons?: object[];
}

// Sorry, the name for this is bad... suggestions welcome.
// This implements the screens for both Sessions and People, but not Projects.
// So they are "components" of the project.
// Any children are put in the bar at the lower left.
@observer
export class ComponentTab extends React.Component<IProps> {
  public render() {
    const splitterKey =
      this.props.folderTypeStyleClass + "VerticalSplitPosition";
    const splitterposition = localStorage.getItem(splitterKey) || "300";
    const sp = parseInt(splitterposition, 10);
    // console.log(`folders.selected.index = ${this.props.folders.selected.index}`);
    // console.log(`sessions.items.length = ${this.props.project.sessions.items.length}`);
    if (this.props.folders.selectedIndex >= this.props.folders.items.length)
      throw Error(
        `folders.length = ${this.props.folders.items.length} but selected index is ${this.props.folders.selectedIndex}`
      );

    return (
      <div className={"componentTab " + this.props.folderTypeStyleClass}>
        <SplitPane
          split="vertical"
          defaultSize={sp}
          onChange={(size: any) => localStorage.setItem(splitterKey, size)}
        >
          <div className={"firstColumn"}>
            <FolderList
              nameForPersistingUsersTableConfiguration={
                this.props.nameForPersistingUsersTableConfiguration
              }
              folders={this.props.folders}
              columns={this.props.columns}
              columnWidths={this.props.columnWidths}
            />
            <div className={"newFolderBar"}>{this.props.folderListButtons}</div>
          </div>
          {this.props.folders &&
            this.props.folders.items.length > 0 &&
            this.props.folders.selectedIndex > -1 && (
              <FolderPane
                project={this.props.project}
                folder={this.props.folders.items.[this.props.folders.selectedIndex]}
                folderTypeStyleClass={this.props.folderTypeStyleClass}
                showStandardMetaTabs={true}
                authorityLists={this.props.authorityLists}
                fileListButtons={this.props.fileListButtons}
              >
                <h3 className={"paneTitle"}>
                  {
                    this.props.folders.items[this.props.folders.selectedIndex]
                      .displayName
                  }
                </h3>
              </FolderPane>
            )}
        </SplitPane>
      </div>
    );
  }
  // private static castArray(value) {
  //   return Array.isArray(value) ? value : [value];
  // }
}

// tslint:disable-next-line:no-empty-interface
interface IJustChildrenProps {}
export class FileListButtons extends React.Component<IJustChildrenProps> {
  public render() {
    return this.props.children;
  }
}
export class FolderListButtons extends React.Component<IJustChildrenProps> {
  public render() {
    return this.props.children;
  }
}
