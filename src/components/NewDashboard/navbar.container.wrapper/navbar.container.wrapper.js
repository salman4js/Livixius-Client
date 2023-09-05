import React from 'react';
import { _renderNavbar } from '../../common.functions/common.functions.view';

const NavbarWrapper = (props) => {
  return _renderNavbar(props.params.id, props.params.accIdAndName);
}

export default NavbarWrapper;