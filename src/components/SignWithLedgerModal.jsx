import React from 'react';
import PropTypes from 'prop-types';

import TransactionDetails from './TransactionDetails';
import images from '../images';
import Driver from '../lib/Driver';

export default class GlobalModal extends React.Component {
    constructor(props) {
        super(props);

        this.unsubModal = this.props.d.modal.event.sub(() => {
            this.forceUpdate();
        });

        this.unsubSession = this.props.d.session.event.sub(() => {
            this.forceUpdate();
        });

        this.state = {};
    }

    componentDidMount() {
        this.sendTransactionToLedger();
    }

    componentWillUnmount() {
        this.unsubModal();
        this.unsubSession();
    }

    getTransactionStatus() {
        const d = this.props.d;

        const { error, result } = this.state;
        const waitingForConfirm = error === undefined && result === undefined;
        console.log(this.state.result);

        return (
            <div className="LedgerPopup_footer">
                <div className="Footer_transaction">
                    {waitingForConfirm ? (
                        <React.Fragment>
                            <img src={images['icon-circle-preloader-gif']} alt="preloader" />{' '}
                            <span>Waiting for your confirmation</span>
                        </React.Fragment>
                    ) : null}

                    {error ? (
                        <React.Fragment>
                            <img src={images['icon-circle-fail']} alt="preloader" /> <span>{error}</span>
                        </React.Fragment>
                    ) : null}
                </div>

                <div className="Action_buttons">
                    {waitingForConfirm ? (
                        <button
                            className="btn_cancel"
                            onClick={() => {
                                d.modal.handlers.cancel();
                            }}>
                            Cancel
                        </button>
                    ) : null}

                    {error ? (
                        <button className="s-button" onClick={this.sendTransactionToLedger()}>
                            <span>
                                <img src={images['icon-circle-retry']} alt="preloader" /> Retry
                            </span>
                        </button>
                    ) : null}
                </div>
            </div>
        );
    }

    sendTransactionToLedger() {
        const d = this.props.d;

        d.session.account
            .signWithLedger(d.modal.inputData)
            .then((result) => {
                this.setState({
                    result,
                });
                d.modal.handlers.finish(result);
            })
            .catch((error) => {
                if (error.message === 'Transaction approval request was rejected') {
                    d.modal.handlers.cancel(error.message);
                } else {
                    this.setState({
                        error: error.message,
                    });
                }
            });
    }

    render() {
        const d = this.props.d;
        const transactionStatus = this.getTransactionStatus();

        return (
            <div className="GlobalModal">
                <div className="GlobalModal__header">Sign transaction with your Ledger</div>

                <div className="LedgerPopup">
                    <div className="LedgerPopup_header">
                        <img src={images['ledger-logo']} className="img--noSelect" alt="Ledger Logo" />
                        <p>Confirm transaction on your Ledger device</p>
                    </div>
                    <TransactionDetails tx={d.modal.inputData} />

                    {transactionStatus}
                </div>
            </div>
        );
    }
}

GlobalModal.propTypes = {
    d: PropTypes.instanceOf(Driver).isRequired,
};
