
package com.smartcart_ai;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateOrderRequest {

    @NotBlank(message = "Customer name is required.")
    private String customerName;

    @NotBlank(message = "Customer email is required.")
    @Email(message = "Please provide a valid email address.")
    private String customerEmail;

    @NotEmpty(message = "An order must contain at least one item.")
    private List<@Valid OrderItemRequest> items;

    public CreateOrderRequest() {
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
