import React from 'react';
import PropTypes from 'prop-types';
import images from '../../../../../images';
import FederationInpit from './FederationInput/FederationInput';
import CopyButton from '../../../../CopyButton';
import Driver from '../../../../../lib/Driver';

export const MIN_FED_LENGTH = 4;

export default class Federation extends React.Component {
    constructor(props) {
        super(props);
        const { userFederation, federationError } = this.props.d.session;

        this.state = {
            isEditing: false,
            fedError: federationError,
            address: userFederation,
        };
    }

    componentWillUnmount() {
        this.props.d.session.federationError = null;
    }

    getContent() {
        const { isEditing, address } = this.state;
        const { userFederation } = this.props.d.session;
        const disableSaveButton = address.length < MIN_FED_LENGTH || address === userFederation;
        const fedExists = address !== '';

        let leftFedBlock;
        let rightControlBlock;

        if (isEditing) {
            leftFedBlock = (
                <React.Fragment>
                    <p>New federation address</p>
                    <FederationInpit address={address} onUpdate={inputValue => this.updateInputValue(inputValue)} />
                </React.Fragment>
            );
            rightControlBlock = (
                <React.Fragment>
                    <button className="b_transparent" onClick={() => this.handleEditToggle()}>
                        Cancel
                    </button>
                    <button className="s-button" onClick={() => this.handleBtnSave()} disabled={disableSaveButton}>
                        Save
                    </button>
                </React.Fragment>
            );
        } else if (fedExists && !isEditing) {
            leftFedBlock = (
                <React.Fragment>
                    <p>Your StellarTerm federation address</p>
                    <strong onClick={() => this.handleEditToggle()}>{`${address}*stellarterm.com`}</strong>
                </React.Fragment>
            );
            rightControlBlock = (
                <React.Fragment>
                    <div className="CopyButton" onClick={() => this.handleEditToggle()}>
                        <img src={images['icon-edit']} alt="edit" width="24" height="24" />
                        <span>EDIT</span>
                    </div>
                    <CopyButton text={`${address}*stellarterm.com`} />
                </React.Fragment>
            );
        } else if (!fedExists && !isEditing) {
            leftFedBlock = <p className="no_federation_text">StellarTerm federation address</p>;
            rightControlBlock = (
                <button className="s-button" onClick={() => this.handleEditToggle()}>
                    Enable
                </button>
            );
        }

        return (
            <div className={`Account_alert ${isEditing ? 'alert_isEditing' : ''}`}>
                <div className="Account_alert_left">{leftFedBlock}</div>
                <div className="Account_alert_right">{rightControlBlock}</div>
            </div>
        );
    }

    getErrorBlock() {
        const { fedError } = this.state;

        return fedError !== null ? (
            <p className="Federation_warning">
                <span>
                    <img src={images['icon-error-triangle']} alt="Error" />
                </span>
                <span>{fedError}</span>
            </p>
        ) : null;
    }

    updateInputValue(inputValue) {
        this.setState({
            address: inputValue,
        });
    }

    handleEditToggle() {
        const { userFederation } = this.props.d.session;

        this.props.d.session.federationError = null;
        this.setState({
            isEditing: !this.state.isEditing,
            address: userFederation,
            fedError: null,
        });
    }

    handleBtnSave() {
        const { handlers } = this.props.d.session;

        handlers.setFederation(this.state.address).then(() => {
            const { federationError, userFederation } = this.props.d.session;
            this.setState({
                isEditing: federationError !== null,
                fedError: federationError,
                address: userFederation,
            });
        });
    }

    render() {
        const errorBlock = this.getErrorBlock();
        const content = this.getContent();

        return (
            <div className="Federations_block">
                {content}

                {errorBlock}

                <p className="AccountView_text">
                    You can set an alias for your StellarTerm account. We’ll use this in our trollbox, and it will
                    become your payment alias, so people can send you money more easily. You can use this alias,
                    including name*stellarterm.com, instead of your public key to receive payments on Stellar.
                </p>
            </div>
        );
    }
}

Federation.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
